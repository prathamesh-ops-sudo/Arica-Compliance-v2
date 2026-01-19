import { Router } from 'express';
import { reportController } from '../controllers';

const router = Router();

router.get('/:orgId', reportController.getReport);

export const reportRoutes = router;
