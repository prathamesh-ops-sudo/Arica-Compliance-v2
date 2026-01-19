import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const organization = await storage.getOrganization(req.params.id);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  app.post("/api/organizations", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1, "Organization name is required"),
        complianceScore: z.number().min(0).max(100).optional(),
        lastScanDate: z.string().optional(),
        status: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const organization = await storage.createOrganization(data);
      res.status(201).json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create organization" });
    }
  });

  app.post("/api/questionnaire/user", async (req, res) => {
    try {
      const schema = z.object({
        responses: z.record(z.string()),
        organizationId: z.string().optional(),
      });

      const data = schema.parse(req.body);

      const response = await storage.createUserQuestionnaireResponse({
        organizationId: data.organizationId || "anonymous",
        responses: JSON.stringify(data.responses),
        submittedAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Questionnaire submitted successfully",
        id: response.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to submit questionnaire" });
    }
  });

  app.get("/api/questionnaire/user", async (req, res) => {
    try {
      const responses = await storage.getUserQuestionnaireResponses();
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questionnaire responses" });
    }
  });

  app.post("/api/questionnaire/provider", async (req, res) => {
    try {
      const schema = z.object({
        responses: z.record(z.string()),
        organizationId: z.string().optional(),
      });

      const data = schema.parse(req.body);

      const response = await storage.createProviderQuestionnaireResponse({
        organizationId: data.organizationId || "internal",
        responses: JSON.stringify(data.responses),
        submittedAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: "Provider review submitted successfully",
        id: response.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to submit provider review" });
    }
  });

  app.get("/api/questionnaire/provider", async (req, res) => {
    try {
      const responses = await storage.getProviderQuestionnaireResponses();
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider responses" });
    }
  });

  return httpServer;
}
