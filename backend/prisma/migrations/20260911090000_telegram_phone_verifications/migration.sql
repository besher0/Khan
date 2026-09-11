CREATE TYPE "PhoneVerificationPurpose" AS ENUM ('REGISTER', 'RESET_PASSWORD');

CREATE TABLE "PhoneVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" "PhoneVerificationPurpose" NOT NULL,
    "requestId" TEXT NOT NULL,
    "payload" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PhoneVerification_requestId_key" ON "PhoneVerification"("requestId");
CREATE INDEX "PhoneVerification_phone_purpose_idx" ON "PhoneVerification"("phone", "purpose");
CREATE INDEX "PhoneVerification_requestId_idx" ON "PhoneVerification"("requestId");
CREATE INDEX "PhoneVerification_expiresAt_idx" ON "PhoneVerification"("expiresAt");
