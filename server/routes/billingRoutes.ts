import { Router } from 'express';
import { billingController } from '../controllers';
import { apiRateLimiter } from '../middleware';

const router = Router();

router.get('/plans', billingController.getPlans);
router.post('/subscribe', apiRateLimiter, billingController.subscribe);
router.post('/cancel/:subscriptionId', apiRateLimiter, billingController.cancelSubscription);

export default router;
