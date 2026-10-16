import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { ContactConnectionsService } from '../contact-connections/contact-connections.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { isUniqueViolation } from '../prisma/prisma-errors';
import { transitionError } from './contact-request-errors';
import { activeCooldownUntil } from './domain/cooldown';
import { CreateContactRequestDto } from './dto/contact-request.dto';

const alreadyPending = () =>
  AppException.conflict(
    ErrorCode.CONTACT_REQUEST_ALREADY_PENDING,
    'You already have a pending request for this car',
  );

/** Buyer-side commands. Buyer comes from auth, seller from the listing — never the client. */
@Injectable()
export class ContactRequestCommandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly connections: ContactConnectionsService,
    private readonly notifications: NotificationsService,
    private readonly analytics: AnalyticsService,
  ) {}

  async create(buyerId: string, dto: CreateContactRequestDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: {
        id: true,
        sellerId: true,
        status: true,
        title: true,
        seller: { select: { status: true } },
      },
    });
    if (!listing) throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');
    if (listing.status !== 'ACTIVE' || listing.seller.status !== 'ACTIVE') {
      throw AppException.conflict(ErrorCode.LISTING_NOT_ACTIVE, 'This car is no longer available');
    }
    if (listing.sellerId === buyerId) {
      throw AppException.unprocessable(
        ErrorCode.CONTACT_REQUEST_CANNOT_SELF_REQUEST,
        'You cannot request contact for your own listing',
      );
    }

    const connection = await this.connections.findBetween(buyerId, listing.sellerId);
    if (connection) {
      throw AppException.conflict(
        ErrorCode.CONTACT_ALREADY_CONNECTED,
        'You are already connected with this seller',
        { connectionId: connection.id },
      );
    }

    const key = { buyerId, sellerId: listing.sellerId, sourceListingId: listing.id };
    const latest = await this.prisma.contactRequest.findFirst({
      where: key,
      orderBy: { createdAt: 'desc' },
    });
    if (latest?.status === 'PENDING') throw alreadyPending();
    const cooldownUntil = activeCooldownUntil(latest);
    if (cooldownUntil) {
      throw AppException.conflict(
        ErrorCode.CONTACT_REQUEST_COOLDOWN,
        'You can request contact for this car again later',
        { canRequestAgainAt: cooldownUntil.toISOString() },
      );
    }

    try {
      const { request, notifications } = await this.prisma.$transaction(async (tx) => {
        const buyer = await tx.user.update({
          where: { id: buyerId },
          data: { defaultAllowSellerContact: dto.allowSellerToContact },
        });
        const request = await tx.contactRequest.create({
          data: { ...key, allowSellerToContact: dto.allowSellerToContact },
        });
        await tx.listingStats.updateMany({
          where: { listingId: listing.id },
          data: { contactRequestCount: { increment: 1 } },
        });
        const notifications = await this.notifications.persist(tx, [
          {
            userId: listing.sellerId,
            type: 'CONTACT_REQUEST_RECEIVED',
            title: 'New contact request',
            body: `${buyer.name ?? 'A buyer'} requested contact for your ${listing.title}`,
            data: { requestId: request.id, listingId: listing.id },
          },
        ]);
        return { request, notifications };
      });
      await this.notifications.push(notifications);
      this.analytics.capture(buyerId, 'contact_request_sent', {
        listingId: listing.id,
        allowSellerToContact: dto.allowSellerToContact,
      });
      return { id: request.id, status: request.status, createdAt: request.createdAt };
    } catch (error) {
      // The partial unique index closes the race between two concurrent submissions.
      if (isUniqueViolation(error)) throw alreadyPending();
      throw error;
    }
  }

  /** Buyer withdraws a pending request; the same listing enters the 4-day cooldown. */
  async cancel(buyerId: string, requestId: string) {
    const { count } = await this.prisma.contactRequest.updateMany({
      where: { id: requestId, buyerId, status: 'PENDING' },
      data: { status: 'CANCELLED', cancellationSource: 'BUYER', cancelledAt: new Date() },
    });
    if (!count) {
      const request = await this.prisma.contactRequest.findUnique({ where: { id: requestId } });
      throw transitionError(request, buyerId, 'buyer');
    }
    return { id: requestId, status: 'CANCELLED' as const };
  }
}
