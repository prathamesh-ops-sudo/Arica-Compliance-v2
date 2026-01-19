import { Router } from 'express';
import { seedController } from '../controllers';
import { authMiddleware } from '../middleware';

const router = Router();

router.post('/demo', authMiddleware, seedController.createDemoData);
router.get('/credentials', seedController.getDemoCredentials);

export const seedRoutes = router;
