import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
});

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  complianceScore: integer("compliance_score").notNull().default(0),
  lastScanDate: text("last_scan_date"),
  status: text("status").notNull().default("Pending"),
});

export const userQuestionnaireResponses = pgTable("user_questionnaire_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  responses: text("responses").notNull(),
  submittedAt: text("submitted_at").notNull(),
});

export const providerQuestionnaireResponses = pgTable("provider_questionnaire_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  responses: text("responses").notNull(),
  submittedAt: text("submitted_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  complianceScore: true,
  lastScanDate: true,
  status: true,
});

export const insertUserQuestionnaireSchema = createInsertSchema(userQuestionnaireResponses).pick({
  organizationId: true,
  responses: true,
  submittedAt: true,
});

export const insertProviderQuestionnaireSchema = createInsertSchema(providerQuestionnaireResponses).pick({
  organizationId: true,
  responses: true,
  submittedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export type InsertUserQuestionnaire = z.infer<typeof insertUserQuestionnaireSchema>;
export type UserQuestionnaireResponse = typeof userQuestionnaireResponses.$inferSelect;

export type InsertProviderQuestionnaire = z.infer<typeof insertProviderQuestionnaireSchema>;
export type ProviderQuestionnaireResponse = typeof providerQuestionnaireResponses.$inferSelect;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface Question {
  id: string;
  text: string;
  isoReference: string;
  options: string[];
}

export const userQuestions: Question[] = [
  {
    id: "q1",
    text: "Does the organization have a documented information security policy?",
    isoReference: "ISO 27001 Clause 5.2",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q2",
    text: "Is access to sensitive information restricted based on business needs?",
    isoReference: "ISO 27002 Control 5.15",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q3",
    text: "Are all critical systems protected with up-to-date antivirus/malware protection?",
    isoReference: "ISO 27002 Control 8.7",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q4",
    text: "Is data encryption used for data at rest and in transit?",
    isoReference: "ISO 27002 Control 8.24",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q5",
    text: "Is there a formal incident response plan?",
    isoReference: "ISO 27001 Clause 10.1",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q6",
    text: "Are regular security awareness trainings conducted for employees?",
    isoReference: "ISO 27002 Control 6.3",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q7",
    text: "Is there a documented asset inventory for all information assets?",
    isoReference: "ISO 27002 Control 5.9",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q8",
    text: "Are backup procedures in place and tested regularly?",
    isoReference: "ISO 27002 Control 8.13",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
];

export const providerQuestions: Question[] = [
  {
    id: "pq1",
    text: "Have we completed the automated system scan review?",
    isoReference: "Internal Process",
    options: ["Yes", "No", "In Progress"],
  },
  {
    id: "pq2",
    text: "Have AI-generated gap recommendations been reviewed?",
    isoReference: "Internal Process",
    options: ["Yes", "No", "In Progress"],
  },
  {
    id: "pq3",
    text: "Are remediation timelines agreed with the client?",
    isoReference: "Internal Process",
    options: ["Yes", "No", "Pending Discussion"],
  },
  {
    id: "pq4",
    text: "Has the compliance score been calculated and verified?",
    isoReference: "Internal Process",
    options: ["Yes", "No", "In Progress"],
  },
  {
    id: "pq5",
    text: "Have all critical vulnerabilities been documented?",
    isoReference: "Internal Process",
    options: ["Yes", "No", "Partial"],
  },
];
