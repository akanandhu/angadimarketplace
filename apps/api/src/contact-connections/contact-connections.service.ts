import { Injectable } from '@nestjs/common';
import { ContactRequest, Prisma } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PageQueryDto } from '../common/pagination/page-query.dto';
import { Paginated } from '../common/pagination/paginated';
import { PUBLIC_SELLER_SELECT } from '../listings/listing-includes';
import { presentPublicSeller } from '../listings/presenters/public-listing.presenter';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { contactDetails } from './contact-details';

const PARTY = { select: { ...PUBLIC_SELLER_SELECT, phone: true } } as const;
const INCLUDE = { buyer: PARTY, seller: PARTY } satisfies Prisma.ContactConnectionInclude;
type Connection = Prisma.ContactConnectionGetPayload<{ include: typeof INCLUDE }>;

export type ConnectionRole = 'buyer' | 'seller';

@Injectable()
export class ContactConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaUrlService,
  ) {}

  findBetween(buyerId: string, sellerId: string) {
    return this.prisma.contactConnection.findUnique({
      where: { buyerId_sellerId: { buyerId, sellerId } },
      include: { seller: { select: { phone: true } } },
    });
  }

  /** Creates Buyer -> Seller inside the approval transaction; a no-op if it already exists. */
  async createFromRequest(tx: Prisma.TransactionClient, request: ContactRequest) {
    await tx.contactConnection.createMany({
      data: [
        {
          buyerId: request.buyerId,
          sellerId: request.sellerId,
          createdFromRequestId: request.id,
          sellerCanContactBuyer: request.allowSellerToContact,
        },
      ],
      skipDuplicates: true,
    });
  }

  /** role=buyer: sellers I can contact. role=seller: buyers connected to me. */
  async list(userId: string, role: ConnectionRole, query: PageQueryDto) {
    const where = role === 'buyer' ? { buyerId: userId } : { sellerId: userId };
    const [total, rows] = await Promise.all([
      this.prisma.contactConnection.count({ where }),
      this.prisma.contactConnection.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(
      rows.map((row) => this.present(row, userId)),
      total,
      query.page,
      query.limit,
    );
  }

  async get(userId: string, connectionId: string) {
    const connection = await this.prisma.contactConnection.findUnique({
      where: { id: connectionId },
      include: INCLUDE,
    });
    if (!connection || (connection.buyerId !== userId && connection.sellerId !== userId)) {
      throw AppException.notFound(ErrorCode.CONTACT_CONNECTION_NOT_FOUND, 'Connection not found');
    }
    return this.present(connection, userId);
  }

  /**
   * The buyer always gets the seller's phone. The seller gets the buyer's phone
   * only when the buyer allowed it on the approved request.
   */
  private present(connection: Connection, viewerId: string) {
    const viewerIsBuyer = connection.buyerId === viewerId;
    const other = viewerIsBuyer ? connection.seller : connection.buyer;
    const canSeePhone = viewerIsBuyer || connection.sellerCanContactBuyer;
    return {
      id: connection.id,
      role: viewerIsBuyer ? ('buyer' as const) : ('seller' as const),
      counterpart: presentPublicSeller(other, this.media),
      contact: canSeePhone ? contactDetails(other.phone) : null,
      sellerCanContactBuyer: connection.sellerCanContactBuyer,
      createdAt: connection.createdAt.toISOString(),
    };
  }
}
