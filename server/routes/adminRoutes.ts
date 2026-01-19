import { Router } from 'express';
import { organizationController } from '../controllers';
import { authMiddleware } from '../middleware';

const router = Router();

router.get('/organizations', authMiddleware, organizationController.getAll);
router.get('/organizations/:id', authMiddleware, organizationController.getById);
router.post('/organizations', authMiddleware, organizationController.create);
router.post('/organizations/create-for-user', authMiddleware, organizationController.createForUser);
router.get('/organizations/:id/export', authMiddleware, organizationController.exportData);

export const adminRoutes = router;
