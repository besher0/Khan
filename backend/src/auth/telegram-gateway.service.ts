import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TelegramGatewayResponse<T> = {
  ok: boolean;
  result?: T;
  error?: string;
};

type RequestStatus = {
  request_id: string;
  phone_number: string;
  verification_status?: {
    status: 'code_valid' | 'code_invalid' | 'code_max_attempts_exceeded' | 'expired';
  };
};

@Injectable()
export class TelegramGatewayService {
  private readonly baseUrl = 'https://gatewayapi.telegram.org';

  constructor(private readonly config: ConfigService) {}

  async sendVerificationMessage(phone: string, payload: string) {
    const ttl = this.getNumberConfig('TELEGRAM_GATEWAY_TTL_SECONDS', 300);
    const codeLength = this.getNumberConfig('TELEGRAM_GATEWAY_CODE_LENGTH', 6);
    const callbackUrl = this.config.get<string>('TELEGRAM_GATEWAY_CALLBACK_URL');

    const body: Record<string, string | number> = {
      phone_number: phone,
      code_length: codeLength,
      ttl,
      payload,
    };

    if (callbackUrl) {
      body.callback_url = callbackUrl;
    }

    return this.post<RequestStatus>('sendVerificationMessage', body);
  }

  async checkVerificationStatus(requestId: string, code: string) {
    return this.post<RequestStatus>('checkVerificationStatus', {
      request_id: requestId,
      code,
    });
  }

  private async post<T>(method: string, body: Record<string, unknown>) {
    const token = this.config.get<string>('TELEGRAM_GATEWAY_TOKEN');
    if (!token) {
      throw new ServiceUnavailableException('Telegram Gateway is not configured');
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/${method}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new BadGatewayException('Telegram Gateway request failed');
    }

    const data = (await response.json().catch(() => null)) as TelegramGatewayResponse<T> | null;
    if (!response.ok || !data?.ok || !data.result) {
      throw new BadGatewayException(data?.error || 'Telegram Gateway returned an error');
    }

    return data.result;
  }

  private getNumberConfig(key: string, fallback: number) {
    const raw = this.config.get<string>(key);
    const value = raw ? Number(raw) : fallback;
    return Number.isFinite(value) ? value : fallback;
  }
}
