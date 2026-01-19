import { Router } from 'express';
import { analyzeController } from '../controllers';
import { authMiddleware } from '../middleware';

export const analyzeRoutes = Router();

analyzeRoutes.post('/:orgId', authMiddleware, analyzeController.analyzeOrganization);
analyzeRoutes.get('/:orgId', authMiddleware, analyzeController.getAnalysisResult);
