import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider } from './sms-provider';

/** Development provider: prints the OTP to the server log instead of sending it. */
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger('SMS');

  async sendOtp(phone: string, otp: string): Promise<void> {
    this.logger.log(`OTP for ${phone}: ${otp}`);
  }
}
