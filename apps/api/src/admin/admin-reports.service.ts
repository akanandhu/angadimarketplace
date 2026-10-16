import { Injectable } from '@nestjs/common';
import { ReportStatus } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { Paginated } from '../common/pagination/paginated';
import { PrismaService } from '../prisma/prisma.service';
import { AdminReportsQueryDto } from './dto/admin.dto';

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminReportsQueryDto) {
    const where = { status: query.status ?? ('OPEN' as const) };
    const [total, rows] = await Promise.all([
      this.prisma.listingReport.count({ where }),
      this.prisma.listingReport.findMany({
        where,
        include: {
          listing: { select: { id: true, title: true, slug: true, status: true } },
          reporter: { select: { id: true, name: true, phone: true } },
          resolvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(
      rows.map((row) => ({
        id: row.id,
        reason: row.reason,
        details: row.details,
        status: row.status,
        listing: row.listing,
        reporter: row.reporter,
        resolvedBy: row.resolvedBy,
        resolutionNote: row.resolutionNote,
        resolvedAt: row.resolvedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      query.page,
      query.limit,
    );
  }

  resolve(reportId: string, adminId: string, note?: string) {
    return this.close(reportId, adminId, 'RESOLVED', note);
  }

  dismiss(reportId: string, adminId: string, note?: string) {
    return this.close(reportId, adminId, 'DISMISSED', note);
  }

  private async close(reportId: string, adminId: string, status: ReportStatus, note?: string) {
    const { count } = await this.prisma.listingReport.updateMany({
      where: { id: reportId, status: 'OPEN' },
      data: {
        status,
        resolvedById: adminId,
        resolvedAt: new Date(),
        resolutionNote: note?.trim() || null,
      },
    });
    if (!count) throw AppException.notFound(ErrorCode.REPORT_NOT_FOUND, 'Open report not found');
    return { id: reportId, status };
  }
}
