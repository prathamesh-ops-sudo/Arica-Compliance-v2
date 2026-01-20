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
  // Context of the organization & requirements (ISO 27001 Clauses 4, 5)
  {
    id: "q1",
    text: "Has the organization identified internal and external issues relevant to information security (e.g. regulatory, contractual, technological, and business factors)?",
    isoReference: "ISO 27001:2022 Clause 4.1",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q2",
    text: "Have information security–relevant needs and expectations of interested parties (customers, regulators, partners, employees) been documented?",
    isoReference: "ISO 27001:2022 Clause 4.2",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q3",
    text: "Is the scope of the Information Security Management System (ISMS) formally defined, documented, and approved?",
    isoReference: "ISO 27001:2022 Clause 4.3",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q4",
    text: "Is there a documented information security policy that is communicated within the organization and regularly reviewed?",
    isoReference: "ISO 27001:2022 Clause 5.2 / ISO 27002:2022 5.1",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q5",
    text: "Is top management demonstrably committed to information security (e.g. assigning roles, providing resources, setting objectives)?",
    isoReference: "ISO 27001:2022 Clause 5.1",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Risk management & planning (Clauses 6, Annex A governance controls)
  {
    id: "q6",
    text: "Is there a formal, documented information security risk assessment methodology in place?",
    isoReference: "ISO 27001:2022 Clause 6.1.2",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q7",
    text: "Are information security risks identified, analyzed, and evaluated at planned intervals or when significant changes occur?",
    isoReference: "ISO 27001:2022 Clause 6.1.2 / ISO 27002:2022 8.28",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q8",
    text: "Is there a documented risk treatment plan including selected Annex A controls and justification for exclusions?",
    isoReference: "ISO 27001:2022 Clause 6.1.3",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q9",
    text: "Are measurable information security objectives defined, monitored, and aligned with business goals?",
    isoReference: "ISO 27001:2022 Clause 6.2",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Support: resources, competence, awareness, documentation (Clause 7)
  {
    id: "q10",
    text: "Are sufficient resources (people, tools, budget) allocated to implement and maintain the ISMS?",
    isoReference: "ISO 27001:2022 Clause 7.1",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q11",
    text: "Is the competence of personnel affecting information security determined, documented, and regularly reviewed?",
    isoReference: "ISO 27001:2022 Clause 7.2 / ISO 27002:2022 6.3",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q12",
    text: "Do employees and contractors receive regular information security awareness and training appropriate to their roles?",
    isoReference: "ISO 27002:2022 6.3",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q13",
    text: "Are documented information security procedures, guidelines, and standards maintained and accessible to relevant personnel?",
    isoReference: "ISO 27001:2022 Clause 7.5",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Asset management (Annex A 5 – Information Security Policies, 5.9, 5.10, etc.)
  {
    id: "q14",
    text: "Is there an up-to-date inventory of information assets (including data, applications, infrastructure, and devices)?",
    isoReference: "ISO 27002:2022 5.9",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q15",
    text: "Are asset owners assigned for critical assets with defined responsibilities?",
    isoReference: "ISO 27002:2022 5.9",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q16",
    text: "Are information assets classified (e.g. Public, Internal, Confidential) with handling rules based on classification?",
    isoReference: "ISO 27002:2022 5.12 / 5.13",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Human resource security (Annex A 6)
  {
    id: "q17",
    text: "Are background checks (where legally permitted) performed for employees and contractors in sensitive roles?",
    isoReference: "ISO 27002:2022 6.1",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q18",
    text: "Do employment or contractor agreements include information security responsibilities and confidentiality clauses?",
    isoReference: "ISO 27002:2022 6.2",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q19",
    text: "Is there a formal offboarding process ensuring timely revocation of access, return of assets, and removal from distribution lists?",
    isoReference: "ISO 27002:2022 6.4",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Access control (Annex A 5, 8)
  {
    id: "q20",
    text: "Is access to networks, systems, and applications granted based on least privilege and need-to-know principles?",
    isoReference: "ISO 27002:2022 5.15 / 8.2",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q21",
    text: "Are user access rights reviewed at planned intervals (e.g. quarterly) to confirm appropriateness?",
    isoReference: "ISO 27002:2022 5.16",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q22",
    text: "Is strong authentication (e.g. MFA) enforced for access to critical systems and remote access?",
    isoReference: "ISO 27002:2022 5.17 / 8.3",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q23",
    text: "Are privileged accounts (administrators, root, service accounts) tightly controlled, monitored, and logged?",
    isoReference: "ISO 27002:2022 5.18",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Cryptography & key management (Annex A 8)
  {
    id: "q24",
    text: "Is there a documented cryptographic policy specifying algorithms, key lengths, and appropriate use of encryption?",
    isoReference: "ISO 27002:2022 8.24",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q25",
    text: "Is sensitive data encrypted at rest in databases, storage systems, and backup media where appropriate?",
    isoReference: "ISO 27002:2022 8.24",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q26",
    text: "Is sensitive data encrypted in transit using secure protocols (e.g. TLS 1.2+), including for remote connections and APIs?",
    isoReference: "ISO 27002:2022 8.24",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q27",
    text: "Are cryptographic keys managed securely throughout their lifecycle (generation, storage, rotation, revocation, destruction)?",
    isoReference: "ISO 27002:2022 8.25 / 8.26",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Physical and environmental security (Annex A 7)
  {
    id: "q28",
    text: "Are facilities housing critical infrastructure protected by physical access controls (e.g. badges, locks, CCTV, visitor logs)?",
    isoReference: "ISO 27002:2022 7.1 / 7.4",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q29",
    text: "Are environmental controls (fire detection, power protection, climate control) implemented for critical equipment?",
    isoReference: "ISO 27002:2022 7.8 / 7.9",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Operations security, monitoring, malware, backup (Annex A 8)
  {
    id: "q30",
    text: "Are operating procedures for critical systems documented, maintained, and followed?",
    isoReference: "ISO 27002:2022 8.1",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q31",
    text: "Is anti-malware protection deployed on relevant endpoints and servers, with regular updates and scans?",
    isoReference: "ISO 27002:2022 8.7",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q32",
    text: "Are system logs (security, access, changes) collected, protected, and reviewed for anomalies?",
    isoReference: "ISO 27002:2022 8.15 / 8.16",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q33",
    text: "Are backup procedures defined, executed, and periodically tested for data restoration?",
    isoReference: "ISO 27002:2022 8.13",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Network and communications security (Annex A 8)
  {
    id: "q34",
    text: "Are networks segmented to separate critical environments (e.g. production, development, management, guest)?",
    isoReference: "ISO 27002:2022 8.20",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q35",
    text: "Are secure configurations (firewalls, IDS/IPS, VPNs) implemented and regularly reviewed for the network perimeter?",
    isoReference: "ISO 27002:2022 8.21 / 8.22",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q36",
    text: "Are technical and organizational measures in place to protect information in transit over public or untrusted networks?",
    isoReference: "ISO 27002:2022 8.23 / 8.24",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // System acquisition, development, and change management (Annex A 8)
  {
    id: "q37",
    text: "Are security requirements defined, documented, and considered in system acquisition and software development projects?",
    isoReference: "ISO 27002:2022 8.25 / 8.32",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q38",
    text: "Is there a formal change management process for systems, applications, and infrastructure, including risk assessment and approvals?",
    isoReference: "ISO 27002:2022 8.32",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q39",
    text: "Are development, test, and production environments separated with controlled access between them?",
    isoReference: "ISO 27002:2022 8.31",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q40",
    text: "Are security tests (e.g. vulnerability scans, penetration tests, code reviews) performed for critical systems and major changes?",
    isoReference: "ISO 27002:2022 8.8 / 8.28",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Supplier & third‑party security (Annex A 5, 6)
  {
    id: "q41",
    text: "Are information security requirements defined, documented, and included in contracts with suppliers and service providers?",
    isoReference: "ISO 27002:2022 5.19 / 5.20",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q42",
    text: "Are supplier information security risks assessed and monitored on a regular basis (e.g. SOC reports, questionnaires, audits)?",
    isoReference: "ISO 27002:2022 5.21",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Incident management (Annex A 5, 8)
  {
    id: "q43",
    text: "Is there a documented information security incident management process that defines roles, escalation paths, and communication?",
    isoReference: "ISO 27002:2022 5.24 / 5.25",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q44",
    text: "Are information security events and weaknesses logged, reported, and reviewed in a timely manner?",
    isoReference: "ISO 27002:2022 5.25",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q45",
    text: "Are lessons learned from information security incidents used to improve controls and procedures?",
    isoReference: "ISO 27002:2022 5.26",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Business continuity & resilience (Annex A 5, 8)
  {
    id: "q46",
    text: "Have business continuity requirements for information security (RTO/RPO, critical processes) been identified and documented?",
    isoReference: "ISO 27002:2022 5.29",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q47",
    text: "Are documented business continuity and disaster recovery plans in place for critical information systems and services?",
    isoReference: "ISO 27002:2022 5.30 / 8.4",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q48",
    text: "Are business continuity and disaster recovery plans periodically tested and updated based on test outcomes?",
    isoReference: "ISO 27002:2022 5.31",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },

  // Compliance, audit, and continual improvement (Clauses 9, 10, Annex A 5)
  {
    id: "q49",
    text: "Are applicable legal, regulatory, and contractual requirements related to information security identified and regularly reviewed?",
    isoReference: "ISO 27001:2022 Clause 4.2 / ISO 27002:2022 5.34",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q50",
    text: "Are internal ISMS audits performed at planned intervals and do they cover the full scope of the ISMS?",
    isoReference: "ISO 27001:2022 Clause 9.2",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q51",
    text: "Does top management conduct regular management reviews of the ISMS, including performance, risks, incidents, and improvement opportunities?",
    isoReference: "ISO 27001:2022 Clause 9.3",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
  {
    id: "q52",
    text: "Is there a defined process for handling nonconformities and implementing corrective actions related to information security?",
    isoReference: "ISO 27001:2022 Clause 10.1 / ISO 27002:2022 5.35",
    options: ["Yes", "No", "Partial", "Not Applicable"],
  },
];

export const providerQuestions: Question[] = [
  {
    id: "pq1",
    text: "Has the customer’s completed ISO 27001/27002 questionnaire been fully reviewed for completeness and consistency?",
    isoReference: "Internal Review – Assessment Quality",
    options: ["Yes", "No", "In Progress"],
  },
  {
    id: "pq2",
    text: "Have AI-generated gap and risk recommendations been validated by a human reviewer for accuracy and relevance?",
    isoReference: "Internal Review – AI Validation",
    options: ["Yes", "No", "In Progress"],
  },
  {
    id: "pq3",
    text: "Have remediation actions been prioritized based on risk (e.g. High, Medium, Low) and agreed with the client?",
    isoReference: "Internal Review – Risk Treatment Planning",
    options: ["Yes", "No", "Pending Discussion"],
  },
  {
    id: "pq4",
    text: "Has the calculated compliance score been cross-checked against questionnaire responses and supporting evidence?",
    isoReference: "Internal Review – Score Validation",
    options: ["Yes", "No", "In Progress"],
  },
  {
    id: "pq5",
    text: "Have all critical vulnerabilities and nonconformities been documented with clear descriptions and recommended actions?",
    isoReference: "Internal Review – Findings Documentation",
    options: ["Yes", "No", "Partial"],
  },
  {
    id: "pq6",
    text: "Are all client-provided documents (policies, procedures, diagrams, logs) stored securely and linked to the relevant controls in the report?",
    isoReference: "Internal Review – Evidence Management",
    options: ["Yes", "No", "Partial"],
  },
  {
    id: "pq7",
    text: "Has the final report been peer-reviewed or quality-checked by a second consultant where required by your methodology?",
    isoReference: "Internal Review – Quality Assurance",
    options: ["Yes", "No", "Not Applicable"],
  },
  {
    id: "pq8",
    text: "Have follow-up milestones (e.g. remediation check-ins, re-assessment dates) been proposed and communicated to the client?",
    isoReference: "Internal Review – Engagement Planning",
    options: ["Yes", "No", "In Progress"],
  },
];

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostname: text("hostname").notNull(),
  userType: text("user_type").notNull(), // 'admin' | 'employee'
  scanData: text("scan_data").notNull(), // JSON string
  questionnaireData: text("questionnaire_data"), // JSON string, nullable
  status: text("status").notNull().default("pending"), // 'pending', 'assigned'
  organizationId: varchar("organization_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  hostname: true,
  userType: true,
  scanData: true,
  questionnaireData: true,
  status: true,
  organizationId: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

