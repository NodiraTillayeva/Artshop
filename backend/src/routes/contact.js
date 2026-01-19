import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { sendContactEmail } from '../controllers/contactController.js';

const router = express.Router();

// Rate limiting middleware
const contactLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // 5 requests per window
  message: {
    success: false,
    error: {
      message: 'Too many contact requests from this IP. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateContactForm = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

// POST /api/contact
router.post('/', contactLimiter, validateContactForm, sendContactEmail);

export default router;
