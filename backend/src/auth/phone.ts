import { BadRequestException } from '@nestjs/common';

export function normalizeSyrianPhone(phone: string) {
  const compact = phone.trim().replace(/[\s-]/g, '');

  if (/^09\d{8}$/.test(compact)) {
    return `+963${compact.slice(1)}`;
  }

  if (/^9639\d{8}$/.test(compact)) {
    return `+${compact}`;
  }

  if (/^\+9639\d{8}$/.test(compact)) {
    return compact;
  }

  throw new BadRequestException('Phone number must be a valid Syrian number, like 09xxxxxxxx or +9639xxxxxxxx');
}
