import { Router } from 'express';
import { pdfController } from '../controllers';
import { apiRateLimiter } from '../middleware';

const router = Router();

router.get('/:orgId', apiRateLimiter, pdfController.generatePdfReport);

export default router;
