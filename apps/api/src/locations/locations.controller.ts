import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

const DISTRICT_SELECT = { id: true, name: true, slug: true } as const;

@ApiTags('locations')
@Public()
@Controller('locations')
export class LocationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('states')
  states() {
    return this.prisma.state.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('states/:stateId/districts')
  districts(@Param('stateId', ParseUUIDPipe) stateId: string) {
    return this.prisma.district.findMany({
      where: { stateId },
      select: DISTRICT_SELECT,
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Convenience for clients: all districts of active states (V1: Kerala). */
  @Get('districts')
  allDistricts() {
    return this.prisma.district.findMany({
      where: { state: { isActive: true } },
      select: DISTRICT_SELECT,
      orderBy: { sortOrder: 'asc' },
    });
  }
}
