import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { AppConfig } from '../config/app-config.service';
import { PrismaService } from '../prisma/prisma.service';
import { Queues } from '../queue/queues';
import { REDIS } from '../redis/redis.module';
import { ProcessingResultDto, UploadRequestDto } from './dto/image.dto';
import { ProcessImageJob } from './listing-images.service';
import { sourceObjectKey } from './image-rules';
import { MediaCleanupService } from './storage/media-cleanup.service';
import { ObjectStorageService } from './storage/object-storage.service';

export type UserImageKind = 'avatar' | 'logo';

interface PendingUserImage {
  userId: string;
  kind: UserImageKind;
  storageKey: string;
  mimeType: string;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  failureReason?: string;
}

const PENDING_TTL_SECONDS = 24 * 60 * 60;
const notFound = () => AppException.notFound(ErrorCode.IMAGE_NOT_FOUND, 'Image not found');

/**
 * Profile photos and dealer logos. They go through the same processing pipeline as
 * listing photos (EXIF stripped, resized); the user record only points at READY images.
 */
@Injectable()
export class UserImagesService {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly storage: ObjectStorageService,
    private readonly cleanup: MediaCleanupService,
    private readonly config: AppConfig,
    @InjectQueue(Queues.MEDIA_PROCESSING) private readonly processing: Queue<ProcessImageJob>,
  ) {}

  async requestUpload(userId: string, kind: UserImageKind, dto: UploadRequestDto) {
    if (kind === 'logo') {
      const dealer = await this.prisma.dealerProfile.findUnique({ where: { userId } });
      if (!dealer) {
        throw AppException.unprocessable(
          ErrorCode.DEALER_PROFILE_REQUIRED,
          'Create your dealer profile first',
        );
      }
    }
    const imageId = randomUUID();
    const pending: PendingUserImage = {
      userId,
      kind,
      storageKey: `users/${userId}/${kind}/${imageId}`,
      mimeType: dto.mimeType,
      status: 'UPLOADING',
    };
    await this.save(imageId, pending);
    const upload = await this.storage.presignUpload(
      sourceObjectKey(pending.storageKey, dto.mimeType),
      dto.mimeType,
      dto.sizeBytes,
    );
    return { imageId, upload };
  }

  async complete(userId: string, imageId: string) {
    const pending = await this.load(imageId);
    if (!pending || pending.userId !== userId) throw notFound();
    if (pending.status !== 'UPLOADING') return this.status(userId, imageId);

    const sourceKey = sourceObjectKey(pending.storageKey, pending.mimeType);
    if ((await this.storage.sizeOf(sourceKey)) === null) {
      throw AppException.unprocessable(ErrorCode.INVALID_IMAGE, 'Upload not found. Try again.');
    }
    await this.save(imageId, { ...pending, status: 'PROCESSING' });
    if (this.config.get('MEDIA_LOCAL_PROCESSING')) {
      await this.processing.add('process', { imageId, storageKey: pending.storageKey, sourceKey });
    }
    return this.status(userId, imageId);
  }

  async status(userId: string, imageId: string) {
    const pending = await this.load(imageId);
    if (!pending || pending.userId !== userId) throw notFound();
    return {
      imageId,
      kind: pending.kind,
      status: pending.status,
      failureReason: pending.failureReason ?? null,
    };
  }

  /** Processor callback: swaps the user's image pointer and cleans up the previous one. */
  async applyProcessingResult(imageId: string, result: ProcessingResultDto): Promise<boolean> {
    const pending = await this.load(imageId);
    if (!pending || pending.status === 'READY' || pending.status === 'FAILED') return false;

    if (result.status === 'FAILED') {
      await this.save(imageId, {
        ...pending,
        status: 'FAILED',
        failureReason: result.failureReason,
      });
      return true;
    }
    const previous = await this.swapPointer(pending);
    if (previous && previous !== pending.storageKey) await this.cleanup.deletePrefix(previous);
    await this.save(imageId, { ...pending, status: 'READY' });
    return true;
  }

  private async swapPointer(pending: PendingUserImage): Promise<string | null> {
    if (pending.kind === 'avatar') {
      const user = await this.prisma.user.findUnique({ where: { id: pending.userId } });
      await this.prisma.user.update({
        where: { id: pending.userId },
        data: { profileImageKey: pending.storageKey },
      });
      return user?.profileImageKey ?? null;
    }
    const dealer = await this.prisma.dealerProfile.findUnique({
      where: { userId: pending.userId },
    });
    if (!dealer) return null;
    await this.prisma.dealerProfile.update({
      where: { userId: pending.userId },
      data: { logoKey: pending.storageKey },
    });
    return dealer.logoKey;
  }

  private async load(imageId: string): Promise<PendingUserImage | null> {
    const raw = await this.redis.get(`user-image:${imageId}`);
    return raw ? (JSON.parse(raw) as PendingUserImage) : null;
  }

  private async save(imageId: string, pending: PendingUserImage) {
    await this.redis.set(
      `user-image:${imageId}`,
      JSON.stringify(pending),
      'EX',
      PENDING_TTL_SECONDS,
    );
  }
}
