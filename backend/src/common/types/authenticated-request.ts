import { UserRole } from '@prisma/client';
import { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
  phone: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
