import { Router } from 'express';
import { analyzeController } from '../controllers';

export const analyzeRoutes = Router();

analyzeRoutes.post('/:orgId', analyzeController.analyzeOrganization);
analyzeRoutes.get('/:orgId', analyzeController.getAnalysisResult);
