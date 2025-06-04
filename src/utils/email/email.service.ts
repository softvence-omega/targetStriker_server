import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Transporter, createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EVENT_TYPES, PasswordResetEmailEvent } from 'src/interfaces/event';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);
  private transport: Transporter;
  private readonly user: string;

  constructor(private readonly configService: ConfigService) {
    this.user = this.configService.getOrThrow<string>('USER_EMAIL');

    this.transport = createTransport({
      service: 'gmail',
      auth: {
        user: this.user,
        pass: this.configService.get<string>('PASS'),
      },
    });
  }

  async sendMail(email: string, subject: string, text: string): Promise<void> {
    const mailOptions: Mail.Options = {
      from: this.user,
      to: email,
      subject,
      text,
    };

    this.transport.sendMail(mailOptions, (err, data) => {
      if (err) {
        this.logger.error('Error sending plain email', err);
      } else {
        this.logger.log('Plain email sent', JSON.stringify(data));
      }
    });
  }

  async sendHtmlMail(
    email: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: this.user,
      to: email,
      subject,
      html,
    };

    this.transport.sendMail(mailOptions, (err, data) => {
      if (err) {
        Logger.error('Error sending HTML email', err);
      } else {
        Logger.log('HTML email sent', JSON.stringify(data));
      }
    });
  }

  private buildPasswordResetEmailTemplate(
    code: string,
    expiresInMinutes: number,
    appName: string,
    metadata: Record<string, any> = {},
  ): string {
    const username = metadata.username ? ` ${metadata.username}` : '';
    const resetUrl = metadata.resetUrl || '';

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding-bottom: 20px; }
      .code-container { background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
      .code { font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4a4a4a; }
      .reset-button { display: inline-block; background-color: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
      .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Password Reset</h2>
      </div>
      
      <p>Hello${username},</p>
      
      <p>We received a request to reset your password for your ${appName} account. Use the following code to complete the password reset process:</p>
      
      <div class="code-container">
        <div class="code">${code}</div>
      </div>
      
      <p>This code will expire in <strong>${expiresInMinutes} minutes</strong>.</p>
      
      ${resetUrl ? `<p style="text-align: center;"><a href="${resetUrl}" class="reset-button">Reset Password</a></p>` : ''}
      
      <p>If you didn't request a password reset, you can safely ignore this email. Your account security is important to us.</p>
      
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;
  }

  
  @OnEvent(EVENT_TYPES.PASSWORD_RESET_EMAIL_SEND)
  async handlePasswordResetEmailSend(payload: PasswordResetEmailEvent) {
    const { to, code, subject, expiresInMinutes = 30, metadata = {} } = payload;

    const emailSubject = subject || 'Password Reset Code';

    const appName = metadata?.applicationName || 'Our Application';

    const html = this.buildPasswordResetEmailTemplate(
      code,
      expiresInMinutes,
      appName,
      metadata,
    );

    const text = `Your password reset code is: ${code}. This code will expire in ${expiresInMinutes} minutes.`;

    try {
      await this.sendHtmlMail(to, emailSubject, html);
      Logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send password reset email to ${to}`, error.stack);
      try {
        await this.sendMail(to, emailSubject, text);
        Logger.log(`Fallback plain text password reset email sent to ${to}`);
      } catch (fallbackError) {
        Logger.error(
          `Critical failure: Both HTML and plain text password reset emails failed for ${to}`,
          fallbackError.stack,
        );
      }
    }
  }
}
