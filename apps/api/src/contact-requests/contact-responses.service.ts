import { Injectable } from '@nestjs/common';
import { ContactConnectionsService } from '../contact-connections/contact-connections.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { transitionError } from './contact-request-errors';
import { RejectContactRequestDto } from './dto/contact-request.dto';

const REJECTION_COPY: Record<string, string> = {
  NO_LONGER_AVAILABLE: 'The vehicle is no longer available.',
  NOT_COMFORTABLE_SHARING: 'The seller chose not to share their contact.',
  SUSPECTED_SPAM: 'The seller declined this request.',
  OTHER: 'The seller declined this request.',
};

/** Seller-side decisions on a pending request. */
@Injectable()
export class ContactResponsesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly connections: ContactConnectionsService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * "Share My Contact": in one transaction approve the request, create the directional
   * Buyer -> Seller connection, cancel the buyer's other now-redundant pending requests
   * to this seller, bump stats and notify the buyer.
   */
  async approve(sellerId: string, requestId: string) {
    const notifications = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const { count } = await tx.contactRequest.updateMany({
        where: { id: requestId, sellerId, status: 'PENDING' },
        data: { status: 'APPROVED', respondedAt: now },
      });
      const request = await tx.contactRequest.findUnique({
        where: { id: requestId },
        include: { seller: { select: { name: true, dealerProfile: true } } },
      });
      if (!count || !request) throw transitionError(request, sellerId, 'seller');

      await this.connections.createFromRequest(tx, request);
      await tx.contactRequest.updateMany({
        where: {
          buyerId: request.buyerId,
          sellerId,
          status: 'PENDING',
          id: { not: request.id },
        },
        data: { status: 'CANCELLED', cancellationSource: 'SYSTEM', cancelledAt: now },
      });
      await tx.listingStats.updateMany({
        where: { listingId: request.sourceListingId },
        data: { contactApprovalCount: { increment: 1 } },
      });

      const sellerName =
        request.seller.dealerProfile?.businessName ?? request.seller.name ?? 'The seller';
      return this.notifications.persist(tx, [
        {
          userId: request.buyerId,
          type: 'CONTACT_REQUEST_APPROVED',
          title: 'Contact shared',
          body: `${sellerName} shared their contact with you. You can call or WhatsApp now.`,
          data: { requestId: request.id, listingId: request.sourceListingId },
        },
      ]);
    });
    await this.notifications.push(notifications);
    return { id: requestId, status: 'APPROVED' as const };
  }

  /** Declines only this listing's request; other listings by the seller stay requestable. */
  async reject(sellerId: string, requestId: string, dto: RejectContactRequestDto) {
    const notifications = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.contactRequest.updateMany({
        where: { id: requestId, sellerId, status: 'PENDING' },
        data: {
          status: 'REJECTED',
          respondedAt: new Date(),
          rejectionReason: dto.reason,
          rejectionNote: dto.note?.trim() || null,
        },
      });
      const request = await tx.contactRequest.findUnique({
        where: { id: requestId },
        include: { sourceListing: { select: { title: true } } },
      });
      if (!count || !request) throw transitionError(request, sellerId, 'seller');

      return this.notifications.persist(tx, [
        {
          userId: request.buyerId,
          type: 'CONTACT_REQUEST_REJECTED',
          title: 'Request declined',
          body: `Your request for ${request.sourceListing.title ?? 'a car'} was declined. ${REJECTION_COPY[dto.reason]}`,
          data: { requestId: request.id, listingId: request.sourceListingId },
        },
      ]);
    });
    await this.notifications.push(notifications);
    return { id: requestId, status: 'REJECTED' as const };
  }
}
