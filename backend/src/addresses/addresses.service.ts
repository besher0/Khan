import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto';

const addressOrderBy: Prisma.AddressOrderByWithRelationInput[] = [
  { isDefault: 'desc' },
  { createdAt: 'desc' },
];

function trimmed(value?: string | null) {
  const text = (value ?? '').trim();
  return text.length ? text : undefined;
}

function cleanCoordinate(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: addressOrderBy,
    });
  }

  async get(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    const existingCount = await this.prisma.address.count({ where: { userId } });
    const makeDefault = existingCount === 0 || dto.isDefault === true;

    return this.prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }

      return tx.address.create({
        data: {
          userId,
          label: trimmed(dto.label),
          governorate: trimmed(dto.governorate)!,
          phone: trimmed(dto.phone)!,
          area: trimmed(dto.area)!,
          street: trimmed(dto.street)!,
          building: trimmed(dto.building),
          floor: trimmed(dto.floor),
          additionalInfo: trimmed(dto.additionalInfo),
          latitude: cleanCoordinate(dto.latitude),
          longitude: cleanCoordinate(dto.longitude),
          // Legacy NOT NULL columns kept in sync so old code paths keep working.
          city: trimmed(dto.governorate)!,
          line1: [trimmed(dto.area), trimmed(dto.street)].filter(Boolean).join(' - '),
          isDefault: makeDefault,
        },
      });
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    await this.get(userId, id);

    return this.prisma.address.update({
      where: { id },
      data: {
        label: trimmed(dto.label),
        governorate: trimmed(dto.governorate),
        phone: trimmed(dto.phone),
        area: trimmed(dto.area),
        street: trimmed(dto.street),
        building: trimmed(dto.building),
        floor: trimmed(dto.floor),
        additionalInfo: trimmed(dto.additionalInfo),
        latitude: cleanCoordinate(dto.latitude),
        longitude: cleanCoordinate(dto.longitude),
        // Keep the legacy snapshot columns consistent after edits.
        ...(dto.governorate?.trim() ? { city: dto.governorate.trim() } : {}),
        ...(dto.area?.trim() || dto.street?.trim()
          ? {
              line1: [dto.area?.trim(), dto.street?.trim()].filter(Boolean).join(' - '),
            }
          : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    const address = await this.get(userId, id);

    const remaining = await this.prisma.address.count({
      where: { userId, id: { not: id } },
    });

    await this.prisma.address.delete({ where: { id } });

    // Keep at least one default address when possible.
    if (address.isDefault && remaining > 0) {
      const next = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (next) {
        await this.prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return { ok: true, id };
  }

  async setDefault(userId: string, id: string) {
    const address = await this.get(userId, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      });
      const updated = await tx.address.update({
        where: { id: address.id },
        data: { isDefault: true },
      });
      return updated;
    });
  }

  /** Default address for the authenticated customer, or null. */
  async defaultAddress(userId: string) {
    return this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async assertOwnership(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) {
      throw new BadRequestException('Address not found for this user');
    }
    return address;
  }
}
