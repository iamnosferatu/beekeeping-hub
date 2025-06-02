// Test email credentials script
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmailCredentials = async () => {
  console.log('🧪 Testing email credentials...\n');
  
  console.log('Configuration:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? 'SET' : 'NOT SET'}`);
  console.log(`SMTP_FROM: ${process.env.SMTP_FROM}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    debug: true, // Enable debug output
    logger: true // Log information in console
  });

  try {
    console.log('📡 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    console.log('📧 Sending test email...');
    const testEmail = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: '🧪 BeeKeeper Blog - Email Test',
      html: `
        <h2>Email Test Successful!</h2>
        <p>This is a test email from your BeeKeeper's Blog application.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${process.env.SMTP_HOST}</p>
        <hr>
        <p style="color: #666; font-size: 14px;">If you received this email, your SMTP configuration is working correctly!</p>
      `,
      text: `
Email Test Successful!

This is a test email from your BeeKeeper's Blog application.
Sent at: ${new Date().toLocaleString()}
From: ${process.env.SMTP_HOST}

If you received this email, your SMTP configuration is working correctly!
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Email sent to: ${process.env.SMTP_USER}`);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`Server response: ${error.response}`);
    }
  }
};

// Run the test
testEmailCredentials().then(() => {
  console.log('\n🏁 Email test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});