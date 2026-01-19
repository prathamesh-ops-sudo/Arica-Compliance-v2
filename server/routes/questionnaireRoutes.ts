import { Router } from 'express';
import { questionnaireController } from '../controllers';

const router = Router();

router.post('/submit', questionnaireController.submitQuestionnaire);
router.post('/user', questionnaireController.submitUserQuestionnaire);
router.get('/user', questionnaireController.getUserResponses);
router.post('/provider', questionnaireController.submitProviderQuestionnaire);
router.get('/provider', questionnaireController.getProviderResponses);

export const questionnaireRoutes = router;
