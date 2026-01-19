import express from 'express';
import contactRoutes from './contact.js';

const router = express.Router();

// Contact routes
router.use('/contact', contactRoutes);

export default router;
