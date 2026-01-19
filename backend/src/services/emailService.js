import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
    return null;
  }

  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('Email transporter not configured. Logging email instead:');
      console.log('---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text}`);
      console.log('---');
      // Return true for development without email setup
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};
