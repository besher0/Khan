import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { static as serveStatic } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const allowedOrigins = getAllowedCorsOrigins(config);

  app.setGlobalPrefix('api/v1');
  app.use('/uploads', serveStatic(join(process.cwd(), 'uploads')));
  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        allowedOrigins.includes(origin) ||
        (!isProduction && isDevelopmentOrigin(origin));

      if (allowed) {
        callback(null, true);
        return;
      }

      logger.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
  logger.log(`CORS allowed origins: ${allowedOrigins.join(', ') || '(none configured)'}`);
}

void bootstrap();

function getAllowedCorsOrigins(config: ConfigService) {
  const configured = (config.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (config.get<string>('NODE_ENV') !== 'production') {
    return [
      ...configured,
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4000',
      'http://127.0.0.1:5173',
    ];
  }

  return configured;
}

/**
 * During development the app is reached through many origins that cannot be
 * enumerated up-front: any port on loopback (Vite 5173, Metro 8081, Expo web,
 * Expo Go `exp://` deep links, ...) and LAN IPs because both Vite
 * (`--host 0.0.0.0`) and the backend are exposed on the local network.
 * Only loopback and RFC1918 private addresses are accepted.
 */
function isDevelopmentOrigin(origin: string) {
  let url: URL;

  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return true;
  }

  if (hostname === '::1' || hostname.endsWith('.local')) {
    return true;
  }

  // IPv4 loopback plus private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  return /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(hostname)
    ? hostname === '127.0.0.1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    : false;
}
