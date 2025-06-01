// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP service)
  // For production, use real SMTP credentials from environment variables
  
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // For development, we'll create a test account
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Email templates
const emailTemplates = {
  verifyEmail: (user, verificationUrl) => ({
    subject: 'Verify your email - BeeKeeper\'s Blog',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to BeeKeeper's Blog!</h1>
        
        <p>Hi ${user.first_name || user.username},</p>
        
        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #ffc107; color: #000; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p>This link will expire in 24 hours.</p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account with BeeKeeper's Blog, please ignore this email.
        </p>
      </div>
    `,
    text: `
Welcome to BeeKeeper's Blog!

Hi ${user.first_name || user.username},

Thank you for registering! Please verify your email address by visiting the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with BeeKeeper's Blog, please ignore this email.
    `
  }),

  passwordReset: (user, resetUrl) => ({
    subject: 'Password Reset - BeeKeeper\'s Blog',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        
        <p>Hi ${user.first_name || user.username},</p>
        
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: #fff; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <p>This link will expire in 1 hour.</p>
        
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    `,
    text: `
Password Reset Request

Hi ${user.first_name || user.username},

We received a request to reset your password. Visit the link below to set a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.
    `
  })
};

// Email service class
class EmailService {
  constructor() {
    this.transporter = null;
  }

  async initialize() {
    console.log('💌 EmailService.initialize called');
    if (!this.transporter) {
      console.log('💌 Creating new transporter...');
      this.transporter = createTransporter();
      
      // Verify transporter configuration
      try {
        console.log('💌 Verifying transporter...');
        await this.transporter.verify();
        console.log('💌 Email service is ready');
      } catch (error) {
        console.error('💌 Email service error:', error);
        
        // For development, create ethereal account automatically
        if (process.env.NODE_ENV !== 'production') {
          console.log('💌 Creating Ethereal test account...');
          const testAccount = await nodemailer.createTestAccount();
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
          console.log('💌 Using Ethereal email for testing');
          console.log('💌 Test account:', testAccount.user);
        } else {
          // In production, throw the error instead of falling back to ethereal
          console.error('💌 PRODUCTION EMAIL ERROR - Check your SMTP configuration!');
          console.error('💌 Required environment variables:');
          console.error('💌 SMTP_HOST:', process.env.SMTP_HOST);
          console.error('💌 SMTP_PORT:', process.env.SMTP_PORT);
          console.error('💌 SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
          console.error('💌 SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
          throw error;
        }
      }
    } else {
      console.log('💌 Transporter already initialized');
    }
  }

  async sendEmail(to, template) {
    console.log('💌 EmailService.sendEmail called for:', to);
    console.log('💌 Email subject:', template.subject);
    
    await this.initialize();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"BeeKeeper\'s Blog" <noreply@beekeepersblog.com>',
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    console.log('💌 Mail options prepared:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    try {
      console.log('💌 Attempting to send email...');
      const info = await this.transporter.sendMail(mailOptions);
      console.log('💌 Email sent successfully!');
      
      // Log preview URL for development
      const result = { success: true, messageId: info.messageId };
      
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('💌 Message sent: %s', info.messageId);
        console.log('💌 Preview URL: %s', previewUrl);
        
        // Add preview URL to result for development
        if (previewUrl) {
          result.previewUrl = previewUrl;
        }
      }
      
      return result;
    } catch (error) {
      console.error('💌 Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(user, verificationUrl) {
    const template = emailTemplates.verifyEmail(user, verificationUrl);
    return this.sendEmail(user.email, template);
  }

  async sendPasswordResetEmail(user, resetUrl) {
    const template = emailTemplates.passwordReset(user, resetUrl);
    return this.sendEmail(user.email, template);
  }
}

// Export singleton instance
module.exports = new EmailService();