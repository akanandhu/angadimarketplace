import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { ListingImage } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { AppConfig } from '../config/app-config.service';
import { MAX_IMAGES } from '../listings/domain/listing-readiness';
import { ListingAccessService } from '../listings/listing-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { Queues } from '../queue/queues';
import { ProcessingResultDto, UploadRequestDto } from './dto/image.dto';
import { imageStorageKey, MAX_IMAGE_BYTES, sourceObjectKey } from './image-rules';
import { MediaCleanupService } from './storage/media-cleanup.service';
import { ObjectStorageService } from './storage/object-storage.service';

export interface ProcessImageJob {
  imageId: string;
  storageKey: string;
  sourceKey: string;
}

const EDITABLE = ['DRAFT', 'ACTIVE'] as const;

@Injectable()
export class ListingImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ListingAccessService,
    private readonly storage: ObjectStorageService,
    private readonly cleanup: MediaCleanupService,
    private readonly config: AppConfig,
    @InjectQueue(Queues.MEDIA_PROCESSING) private readonly processing: Queue<ProcessImageJob>,
  ) {}

  async requestUpload(listingId: string, userId: string, dto: UploadRequestDto) {
    const listing = await this.access.findOwned(listingId, userId, [...EDITABLE]);
    if (listing.images.length >= MAX_IMAGES) {
      throw AppException.unprocessable(
        ErrorCode.MAX_IMAGES_REACHED,
        `You can add up to ${MAX_IMAGES} photos`,
      );
    }
    const id = randomUUID();
    const storageKey = imageStorageKey(listingId, id);
    const position = Math.max(-1, ...listing.images.map((image) => image.position)) + 1;
    await this.prisma.listingImage.create({
      data: {
        id,
        listingId,
        position,
        storageKey,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        originalFileName: dto.fileName,
      },
    });
    const upload = await this.storage.presignUpload(
      sourceObjectKey(storageKey, dto.mimeType),
      dto.mimeType,
      dto.sizeBytes,
    );
    return { imageId: id, upload };
  }

  /** Issues a fresh upload URL for a failed or abandoned upload. */
  async retry(listingId: string, imageId: string, userId: string, dto: UploadRequestDto) {
    const image = await this.findImage(listingId, imageId, userId);
    if (image.status !== 'FAILED' && image.status !== 'UPLOADING') {
      throw AppException.conflict(ErrorCode.VALIDATION_ERROR, 'This photo does not need a retry');
    }
    await this.prisma.listingImage.update({
      where: { id: imageId },
      data: {
        status: 'UPLOADING',
        failureReason: null,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        originalFileName: dto.fileName,
      },
    });
    const upload = await this.storage.presignUpload(
      sourceObjectKey(image.storageKey, dto.mimeType),
      dto.mimeType,
      dto.sizeBytes,
    );
    return { imageId, upload };
  }

  /** Client confirms the direct-to-S3 upload; the image then awaits processing. */
  async complete(listingId: string, imageId: string, userId: string) {
    const image = await this.findImage(listingId, imageId, userId);
    if (image.status !== 'UPLOADING') return { imageId, status: image.status };

    const sourceKey = sourceObjectKey(image.storageKey, image.mimeType);
    const size = await this.storage.sizeOf(sourceKey);
    if (size === null) {
      throw AppException.unprocessable(ErrorCode.INVALID_IMAGE, 'Upload not found. Try again.');
    }
    if (size > MAX_IMAGE_BYTES) {
      await this.markFailed(imageId, 'File is too large');
      return { imageId, status: 'FAILED' as const };
    }

    await this.prisma.listingImage.updateMany({
      where: { id: imageId, status: 'UPLOADING' },
      data: { status: 'PROCESSING' },
    });
    if (this.config.get('MEDIA_LOCAL_PROCESSING')) {
      await this.processing.add('process', { imageId, storageKey: image.storageKey, sourceKey });
    }
    return { imageId, status: 'PROCESSING' as const };
  }

  async remove(listingId: string, imageId: string, userId: string): Promise<void> {
    const listing = await this.access.findOwned(listingId, userId, [...EDITABLE]);
    const image = listing.images.find((candidate) => candidate.id === imageId);
    if (!image) throw AppException.notFound(ErrorCode.IMAGE_NOT_FOUND, 'Photo not found');

    const otherReady = listing.images.filter((i) => i.id !== imageId && i.status === 'READY');
    if (listing.status === 'ACTIVE' && image.status === 'READY' && otherReady.length === 0) {
      throw AppException.unprocessable(
        ErrorCode.LISTING_NOT_READY,
        'A live listing needs at least one photo',
      );
    }

    const remaining = listing.images.filter((candidate) => candidate.id !== imageId);
    await this.prisma.$transaction([
      this.prisma.listingImage.delete({ where: { id: imageId } }),
      ...remaining.map((candidate, position) =>
        this.prisma.listingImage.update({ where: { id: candidate.id }, data: { position } }),
      ),
    ]);
    await this.cleanup.deletePrefix(image.storageKey);
  }

  async reorder(listingId: string, userId: string, imageIds: string[]): Promise<void> {
    const listing = await this.access.findOwned(listingId, userId, [...EDITABLE]);
    const current = new Set(listing.images.map((image) => image.id));
    const isPermutation =
      imageIds.length === current.size &&
      new Set(imageIds).size === imageIds.length &&
      imageIds.every((id) => current.has(id));
    if (!isPermutation) {
      throw AppException.unprocessable(
        ErrorCode.VALIDATION_ERROR,
        'imageIds must list every photo of the listing exactly once',
      );
    }
    await this.prisma.$transaction(
      imageIds.map((id, position) =>
        this.prisma.listingImage.update({ where: { id }, data: { position } }),
      ),
    );
  }

  /** Called by the image processor. May arrive before the client's `complete`. */
  async applyProcessingResult(imageId: string, result: ProcessingResultDto): Promise<boolean> {
    const { count } = await this.prisma.listingImage.updateMany({
      where: { id: imageId, status: { in: ['UPLOADING', 'PROCESSING'] } },
      data: {
        status: result.status,
        width: result.width ?? null,
        height: result.height ?? null,
        failureReason:
          result.status === 'FAILED' ? (result.failureReason ?? 'Processing failed') : null,
      },
    });
    return count > 0;
  }

  private async findImage(listingId: string, imageId: string, userId: string) {
    const listing = await this.access.findOwned(listingId, userId, [...EDITABLE]);
    const image = listing.images.find((candidate) => candidate.id === imageId);
    if (!image) throw AppException.notFound(ErrorCode.IMAGE_NOT_FOUND, 'Photo not found');
    return image as ListingImage;
  }

  private markFailed(imageId: string, failureReason: string) {
    return this.prisma.listingImage.update({
      where: { id: imageId },
      data: { status: 'FAILED', failureReason },
    });
  }
}
