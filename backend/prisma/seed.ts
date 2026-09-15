import { UserRole } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(role: UserRole, phone: string, email: string, firstName: string, lastName: string, passwordHash: string) {
  return prisma.user.upsert({
    where: { phone },
    update: {},
    create: {
      email,
      phone,
      firstName,
      lastName,
      role,
      passwordHash,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const [admin, ops] = await Promise.all([
    upsertUser(UserRole.ADMIN, '+963990000001', 'admin@khan.local', 'Khan', 'Admin', passwordHash),
    upsertUser(UserRole.OPS, '+963990000002', 'ops@khan.local', 'Khan', 'Ops', passwordHash),
  ]);

  console.log({ admin: admin.phone, ops: ops.phone });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
