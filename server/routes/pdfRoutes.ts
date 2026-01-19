import { Router } from 'express';
import { pdfController } from '../controllers';
import { apiRateLimiter, authMiddleware } from '../middleware';

const router = Router();

router.get('/:orgId', authMiddleware, apiRateLimiter, pdfController.generatePdfReport);

export default router;
