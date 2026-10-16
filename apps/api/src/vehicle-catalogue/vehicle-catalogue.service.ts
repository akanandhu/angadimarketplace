import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';

export interface CatalogueSelection {
  brandId: string;
  modelId: string;
  variantId?: string | null;
}

const invalidSelection = (message: string) =>
  AppException.unprocessable(ErrorCode.INVALID_VEHICLE_CATALOGUE_SELECTION, message);

@Injectable()
export class VehicleCatalogueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaUrlService,
  ) {}

  async brands(search?: string) {
    const brands = await this.prisma.vehicleBrand.findMany({
      where: {
        isActive: true,
        ...(search ? { name: { contains: search.trim(), mode: 'insensitive' } } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: this.media.url(brand.logoKey),
    }));
  }

  models(brandId: string) {
    return this.prisma.vehicleModel.findMany({
      where: { brandId, isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  }

  variants(modelId: string) {
    return this.prisma.vehicleVariant.findMany({
      where: { modelId, isActive: true },
      select: { id: true, name: true, fuelType: true, transmission: true },
      orderBy: { name: 'asc' },
    });
  }

  /** Resolves SEO slugs (e.g. /cars/hyundai/creta) to canonical catalogue records. */
  async resolve(brandSlug: string, modelSlug?: string) {
    const brand = await this.prisma.vehicleBrand.findUnique({
      where: { slug: brandSlug },
      select: { id: true, name: true, slug: true },
    });
    if (!brand) return { brand: null, model: null };
    const model = modelSlug
      ? await this.prisma.vehicleModel.findUnique({
          where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
          select: { id: true, name: true, slug: true },
        })
      : null;
    return { brand, model };
  }

  /**
   * Validates the Brand -> Model -> Variant hierarchy. Inactive records are rejected
   * for new selections but remain valid on existing listings.
   */
  async assertSelection({ brandId, modelId, variantId }: CatalogueSelection) {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { id: modelId },
      include: { brand: true },
    });
    if (!model || !model.isActive || !model.brand.isActive) {
      throw invalidSelection('Unknown vehicle model');
    }
    if (model.brandId !== brandId) throw invalidSelection('Model does not belong to brand');

    if (!variantId) return { brand: model.brand, model, variant: null };
    const variant = await this.prisma.vehicleVariant.findUnique({ where: { id: variantId } });
    if (!variant || !variant.isActive) throw invalidSelection('Unknown vehicle variant');
    if (variant.modelId !== modelId) throw invalidSelection('Variant does not belong to model');
    return { brand: model.brand, model, variant };
  }
}
