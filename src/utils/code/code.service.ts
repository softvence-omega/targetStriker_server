import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ApiResponse } from 'src/common/types/apiResponse';
import { EVENT_TYPES, PasswordResetEmailEvent } from 'src/interfaces/event';
import { EventService } from '../event/event.service';
import { VerifyCodeOnlyDto } from 'src/main/auth/dto/VerifyCodeOnly.Dto';

@Injectable()
export class CodeService {
    private logger = new Logger(CodeService.name)
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventService,
  ) {}

  private generateCode(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  private createCacheKey(identifier): string {
    return `verification:${identifier}`;
  }

  async generateVerificationCode(
    identifier: string,
    expiresInMinutes: number = 5,
  ): Promise<string> {
    try {
      const cacheKey = this.createCacheKey(identifier);

      const existingCode = await this.cacheManager.get(cacheKey);

      if (existingCode) {
        await this.cacheManager.del(cacheKey);
      }

      const code = this.generateCode();

      try {
        // Convert minutes to milliseconds for the cache TTL
        await this.cacheManager.set(
          cacheKey,
          code,
          1000 * 60 * expiresInMinutes,
        );
      } catch (error) {
        console.log(error);
        throw error;
      }

      return code;
    } catch (error) {
      this.logger.error(
        `Failed to generate verification code for ${identifier}`,
        error,
      );

      throw new Error(`Unable to generate verification code: ${error.message}`);
    }
  }

  async verifyCode(identifier: string, code: string): Promise<boolean> {
    const cacheKey = this.createCacheKey(identifier);
    const storedCode = await this.cacheManager.get<string>(cacheKey);

    if (!storedCode || storedCode !== code) {
      return false;
    }

    await this.cacheManager.del(cacheKey);

    return true;
  }

  

  async sendPasswordResetEmail(
    email: string,
    expiresInMinutes: number = 30,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    // Generate verification code and store in cache
    const code = await this.generateVerificationCode(email, expiresInMinutes);

    // Prepare password reset email payload
    const passwordResetPayload: PasswordResetEmailEvent = {
      to: email,
      code,
      expiresInMinutes,
      subject: metadata.subject || 'Password Reset Code',
      metadata: {
        ...metadata,
        type: 'password_reset',
      },
    };

    // Emit event to send the password reset email
    this.eventEmitter.emit(
      EVENT_TYPES.PASSWORD_RESET_EMAIL_SEND,
      passwordResetPayload,
    );

    return code;
  }

  async isCodeValid({
    code,
    email: identifier,
  }: VerifyCodeOnlyDto): Promise<ApiResponse<any>> {
    const cacheKey = this.createCacheKey(identifier);
    const storedCode = await this.cacheManager.get<string>(cacheKey);
    
    if (storedCode !== code) {
      throw new BadRequestException('Code is not valid');  
    }

    return {
      success: true,
      message: 'Code is valid',
      data: {
        isValid: true,
        email: identifier
      },
    };
    
  }
}
