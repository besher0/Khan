CREATE TABLE "NotificationDeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDeviceToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationDeviceToken_token_key" ON "NotificationDeviceToken"("token");

CREATE INDEX "NotificationDeviceToken_userId_idx" ON "NotificationDeviceToken"("userId");

ALTER TABLE "NotificationDeviceToken" ADD CONSTRAINT "NotificationDeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
