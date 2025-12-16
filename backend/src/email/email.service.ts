import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure your SMTP settings here
    // For development/testing, you can use services like Mailtrap or Gmail SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection on initialization
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP connection verified successfully');
      }
    });
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
    resetLink: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@dzemals.com',
        to: email,
        subject: 'Password Reset Request - Dzemals',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">Dzemals</h1>
            </div>
            
            <div style="padding: 20px; background-color: #fff;">
              <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
              
              <p>Dear ${firstName},</p>
              
              <p>We received a request to reset the password for your account. If you did not make this request, you can ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
                <code>${resetLink}</code>
              </p>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This password reset link will expire in 1 hour.
              </p>
              
              <p style="color: #666; font-size: 12px;">
                If you need assistance, please contact our support team.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2025 Dzemals. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `
          Password Reset Request
          
          Dear ${firstName},
          
          We received a request to reset the password for your account. If you did not make this request, you can ignore this email.
          
          To reset your password, visit this link:
          ${resetLink}
          
          This password reset link will expire in 1 hour.
          
          If you need assistance, please contact our support team.
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Password reset email sent to ${email}. MessageId: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationLink: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@dzemals.com',
        to: email,
        subject: 'Verify Your Email - Dzemals',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">Dzemals</h1>
            </div>
            
            <div style="padding: 20px; background-color: #fff;">
              <h2 style="color: #333; margin-top: 0;">Welcome to Dzemals!</h2>
              
              <p>Dear ${firstName},</p>
              
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Email
                </a>
              </div>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This verification link will expire in 24 hours.
              </p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>© 2025 Dzemals. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Verification email sent to ${email}. MessageId: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
      throw error;
    }
  }
}
