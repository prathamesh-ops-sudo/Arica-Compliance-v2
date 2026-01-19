import {
  type User,
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type UserQuestionnaireResponse,
  type InsertUserQuestionnaire,
  type ProviderQuestionnaireResponse,
  type InsertProviderQuestionnaire,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined>;

  getUserQuestionnaireResponses(): Promise<UserQuestionnaireResponse[]>;
  createUserQuestionnaireResponse(response: InsertUserQuestionnaire): Promise<UserQuestionnaireResponse>;

  getProviderQuestionnaireResponses(): Promise<ProviderQuestionnaireResponse[]>;
  createProviderQuestionnaireResponse(response: InsertProviderQuestionnaire): Promise<ProviderQuestionnaireResponse>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private organizations: Map<string, Organization>;
  private userQuestionnaireResponses: Map<string, UserQuestionnaireResponse>;
  private providerQuestionnaireResponses: Map<string, ProviderQuestionnaireResponse>;

  constructor() {
    this.users = new Map();
    this.organizations = new Map();
    this.userQuestionnaireResponses = new Map();
    this.providerQuestionnaireResponses = new Map();

    this.seedOrganizations();
  }

  private seedOrganizations() {
    const seedData: InsertOrganization[] = [
      { name: "TechNova Solutions", complianceScore: 84, lastScanDate: "2026-01-15", status: "Partial" },
      { name: "FinSecure Pvt Ltd", complianceScore: 62, lastScanDate: "2026-01-10", status: "Critical Gaps" },
      { name: "HealthFirst Corp", complianceScore: 91, lastScanDate: "2026-01-18", status: "Compliant" },
      { name: "RetailMax Inc", complianceScore: 73, lastScanDate: "2026-01-12", status: "Partial" },
      { name: "CloudSync Systems", complianceScore: 45, lastScanDate: "2026-01-08", status: "Critical Gaps" },
      { name: "DataGuard Solutions", complianceScore: 88, lastScanDate: "2026-01-17", status: "Compliant" },
    ];

    seedData.forEach((org) => {
      const id = randomUUID();
      this.organizations.set(id, { id, ...org });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { id, ...insertUser, role: insertUser.role || "user" };
    this.users.set(id, user);
    return user;
  }

  async getOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const id = randomUUID();
    const organization: Organization = {
      id,
      name: org.name,
      complianceScore: org.complianceScore ?? 0,
      lastScanDate: org.lastScanDate ?? null,
      status: org.status ?? "Pending",
    };
    this.organizations.set(id, organization);
    return organization;
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const org = this.organizations.get(id);
    if (!org) return undefined;
    const updated = { ...org, ...updates };
    this.organizations.set(id, updated);
    return updated;
  }

  async getUserQuestionnaireResponses(): Promise<UserQuestionnaireResponse[]> {
    return Array.from(this.userQuestionnaireResponses.values());
  }

  async createUserQuestionnaireResponse(response: InsertUserQuestionnaire): Promise<UserQuestionnaireResponse> {
    const id = randomUUID();
    const questionnaireResponse: UserQuestionnaireResponse = { id, ...response };
    this.userQuestionnaireResponses.set(id, questionnaireResponse);
    return questionnaireResponse;
  }

  async getProviderQuestionnaireResponses(): Promise<ProviderQuestionnaireResponse[]> {
    return Array.from(this.providerQuestionnaireResponses.values());
  }

  async createProviderQuestionnaireResponse(response: InsertProviderQuestionnaire): Promise<ProviderQuestionnaireResponse> {
    const id = randomUUID();
    const questionnaireResponse: ProviderQuestionnaireResponse = { id, ...response };
    this.providerQuestionnaireResponses.set(id, questionnaireResponse);
    return questionnaireResponse;
  }
}

export const storage = new MemStorage();
