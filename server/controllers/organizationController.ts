import { type Request, type Response } from 'express';
import { z } from 'zod';
import { organizationService } from '../services';

const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  complianceScore: z.number().min(0).max(100).optional(),
  lastScanDate: z.string().optional(),
  status: z.enum(['Compliant', 'Partial', 'Critical', 'Pending']).optional(),
});

export const organizationController = {
  async getAll(_req: Request, res: Response) {
    try {
      const organizations = await organizationService.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch organizations' });
    }
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    try {
      const id = req.params.id;
      const organization = await organizationService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ error: true, message: 'Organization not found' });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch organization' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = createOrganizationSchema.parse(req.body);
      const organization = await organizationService.createOrganization(data);
      res.status(201).json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: true, message: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: true, message: 'Failed to create organization' });
    }
  },
};
