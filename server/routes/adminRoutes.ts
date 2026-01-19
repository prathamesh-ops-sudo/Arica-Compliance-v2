import { Router } from 'express';
import { organizationController } from '../controllers';

const router = Router();

router.get('/organizations', organizationController.getAll);
router.get('/organizations/:id', organizationController.getById);
router.post('/organizations', organizationController.create);

export const adminRoutes = router;
