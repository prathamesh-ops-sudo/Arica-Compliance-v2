import { type Express } from 'express';
import { adminRoutes } from './adminRoutes';
import { questionnaireRoutes } from './questionnaireRoutes';
import { reportRoutes } from './reportRoutes';
import { organizationRoutes } from './organizationRoutes';

export function registerApiRoutes(app: Express) {
  app.use('/api/admin', adminRoutes);
  app.use('/api/questionnaire', questionnaireRoutes);
  app.use('/api/report', reportRoutes);
  app.use('/api/organizations', organizationRoutes);
}

export { adminRoutes, questionnaireRoutes, reportRoutes, organizationRoutes };
