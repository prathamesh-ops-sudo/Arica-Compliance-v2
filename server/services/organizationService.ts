import { storage } from '../db/storage';
import type { InsertOrganization, Organization } from '@shared/schema';

export const organizationService = {
  async getAllOrganizations(): Promise<Organization[]> {
    return storage.getOrganizations();
  },

  async getOrganizationById(id: string): Promise<Organization | undefined> {
    return storage.getOrganization(id);
  },

  async createOrganization(data: InsertOrganization): Promise<Organization> {
    return storage.createOrganization(data);
  },

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    return storage.updateOrganization(id, updates);
  },
};
