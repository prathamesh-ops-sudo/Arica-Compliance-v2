import { Router } from 'express';
import { organizationController } from '../controllers';

const router = Router();

router.get('/', organizationController.getAll);
router.get('/:id', organizationController.getById);
router.post('/', organizationController.create);

export const organizationRoutes = router;
