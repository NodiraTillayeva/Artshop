import { validationResult } from 'express-validator';
import { sendEmail } from '../services/emailService.js';

export const sendContactEmail = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    const { name, email, subject, message, artworkId } = req.body;

    // Build email content
    let emailBody = `
New contact form submission from ${name}

Email: ${email}
Subject: ${subject}

Message:
${message}
    `;

    if (artworkId) {
      emailBody += `\n\nArtwork Inquiry: ${artworkId}`;
    }

    // Send email
    const emailSent = await sendEmail({
      to: process.env.EMAIL_TO || 'artist@example.com',
      subject: `Contact Form: ${subject}`,
      text: emailBody,
    });

    if (!emailSent) {
      throw new Error('Failed to send email');
    }

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    next(error);
  }
};
