import { Router } from 'express';
import { analyticsController } from '../controllers';
import { authMiddleware } from '../middleware';

const router = Router();

router.get('/:orgId/stats', authMiddleware, analyticsController.getUsageStats);
router.get('/:orgId/events', authMiddleware, analyticsController.getRecentEvents);

export const analyticsRoutes = router;
