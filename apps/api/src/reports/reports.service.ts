import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { isUniqueViolation } from '../prisma/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './reports.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, listingId: string, dto: CreateReportDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { status: true, sellerId: true },
    });
    if (!listing || listing.status === 'DRAFT') {
      throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');
    }
    if (listing.sellerId === reporterId) {
      throw AppException.unprocessable(ErrorCode.FORBIDDEN, 'You cannot report your own listing');
    }
    try {
      const report = await this.prisma.listingReport.create({
        data: { listingId, reporterId, reason: dto.reason, details: dto.details?.trim() || null },
      });
      return { id: report.id, status: report.status };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw AppException.conflict(
          ErrorCode.VALIDATION_ERROR,
          'You have already reported this listing. We are reviewing it.',
        );
      }
      throw error;
    }
  }
}
