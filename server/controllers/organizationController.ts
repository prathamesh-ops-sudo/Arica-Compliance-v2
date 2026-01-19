import { type Request, type Response } from 'express';
import { z } from 'zod';
import { organizationService } from '../services';
import type { AuthenticatedRequest } from '../middleware';

const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  complianceScore: z.number().min(0).max(100).optional(),
  lastScanDate: z.string().optional(),
  status: z.enum(['Compliant', 'Partial', 'Critical', 'Pending']).optional(),
});

export const organizationController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userOrgId = req.user?.organizationId;
      
      if (userOrgId) {
        const organization = await organizationService.getOrganizationById(userOrgId);
        if (organization) {
          return res.json([organization]);
        }
        return res.json([]);
      }
      
      if (req.user?.role === 'admin') {
        const organizations = await organizationService.getAllOrganizations();
        return res.json(organizations);
      }
      
      const organizations = await organizationService.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch organizations' });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userOrgId = req.user?.organizationId;
      
      if (userOrgId && userOrgId !== id && req.user?.role !== 'admin') {
        return res.status(403).json({ error: true, message: 'Access denied to this organization' });
      }
      
      const organization = await organizationService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ error: true, message: 'Organization not found' });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: true, message: 'Failed to fetch organization' });
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
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

  async createForUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationName } = req.body;
      const userEmail = req.user?.email;
      const userId = req.user?.sub;

      if (!organizationName) {
        return res.status(400).json({ error: true, message: 'Organization name is required' });
      }

      if (!userEmail || !userId) {
        return res.status(401).json({ error: true, message: 'User not authenticated' });
      }
      
      const organization = await organizationService.createOrganization({
        name: organizationName,
        complianceScore: 0,
        status: 'Pending',
        lastScanDate: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        organization,
        orgId: organization.id,
        message: 'Organization created successfully. Please update your profile with this organization ID.',
      });
    } catch (error) {
      console.error('Create organization for user error:', error);
      res.status(500).json({ error: true, message: 'Failed to create organization' });
    }
  },

  async exportData(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const userOrgId = req.user?.organizationId;
      
      if (userOrgId && userOrgId !== id && req.user?.role !== 'admin') {
        return res.status(403).json({ error: true, message: 'Access denied to this organization' });
      }
      
      const organization = await organizationService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ error: true, message: 'Organization not found' });
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        exportedBy: req.user?.email,
        organization: {
          id: organization.id,
          name: organization.name,
          complianceScore: organization.complianceScore,
          status: organization.status,
          lastScanDate: organization.lastScanDate,
        },
        metadata: {
          version: '1.0',
          format: 'JSON',
        },
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="org-${id}-export-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({ error: true, message: 'Failed to export organization data' });
    }
  },
};
