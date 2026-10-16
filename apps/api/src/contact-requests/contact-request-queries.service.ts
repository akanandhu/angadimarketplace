import { Injectable } from '@nestjs/common';
import { Paginated } from '../common/pagination/paginated';
import { contactDetails } from '../contact-connections/contact-details';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { presentIncoming, presentOutgoing, REQUEST_INCLUDE } from './contact-request.presenter';
import { activeCooldownUntil } from './domain/cooldown';
import { ContactRequestsQueryDto } from './dto/contact-request.dto';

@Injectable()
export class ContactRequestQueriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaUrlService,
  ) {}

  async incoming(sellerId: string, query: ContactRequestsQueryDto) {
    const where = { sellerId, ...(query.status ? { status: query.status } : {}) };
    const [total, rows] = await Promise.all([
      this.prisma.contactRequest.count({ where }),
      this.prisma.contactRequest.findMany({
        where,
        include: REQUEST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(
      rows.map((row) => presentIncoming(row, this.media)),
      total,
      query.page,
      query.limit,
    );
  }

  async outgoing(buyerId: string, query: ContactRequestsQueryDto) {
    const where = { buyerId, ...(query.status ? { status: query.status } : {}) };
    const [total, rows] = await Promise.all([
      this.prisma.contactRequest.count({ where }),
      this.prisma.contactRequest.findMany({
        where,
        include: REQUEST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    const connections = await this.prisma.contactConnection.findMany({
      where: { buyerId, sellerId: { in: [...new Set(rows.map((row) => row.sellerId))] } },
      include: { seller: { select: { phone: true } } },
    });
    const phones = new Map(connections.map((c) => [c.sellerId, c.seller.phone]));
    return Paginated.of(
      rows.map((row) => {
        const phone = phones.get(row.sellerId);
        return presentOutgoing(row, this.media, phone ? contactDetails(phone) : null);
      }),
      total,
      query.page,
      query.limit,
    );
  }

  /** Drives the listing page CTA: own listing, connected, or the state of this listing's request. */
  async contactState(buyerId: string, sellerId: string, listingId?: string) {
    if (buyerId === sellerId) return { state: 'OWN' as const };

    const connection = await this.prisma.contactConnection.findUnique({
      where: { buyerId_sellerId: { buyerId, sellerId } },
      include: { seller: { select: { phone: true } } },
    });
    if (connection) {
      return {
        state: 'CONNECTED' as const,
        connectionId: connection.id,
        sellerContact: contactDetails(connection.seller.phone),
      };
    }

    const latest = listingId
      ? await this.prisma.contactRequest.findFirst({
          where: { buyerId, sellerId, sourceListingId: listingId },
          orderBy: { createdAt: 'desc' },
        })
      : null;
    const cooldownUntil = activeCooldownUntil(latest);
    return {
      state: 'NOT_CONNECTED' as const,
      listingRequest: latest
        ? {
            id: latest.id,
            status: latest.status,
            rejectionReason: latest.rejectionReason,
            createdAt: latest.createdAt.toISOString(),
            canRequestAgainAt: cooldownUntil?.toISOString() ?? null,
          }
        : null,
      canRequest: latest?.status !== 'PENDING' && !cooldownUntil,
    };
  }
}
