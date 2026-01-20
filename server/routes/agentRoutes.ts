import { Router } from "express";
import { storage } from "../db/storage";
import { insertReportSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Agent upload endpoint
router.post("/", async (req, res) => {
    try {
        const reportData = insertReportSchema.parse(req.body);
        const report = await storage.createReport(reportData);
        res.json(report);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Invalid report data", errors: error.errors });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
});

// Get all unassigned reports
router.get("/unassigned", async (req, res) => {
    try {
        const unassignedReports = await storage.getUnassignedReports();
        res.json(unassignedReports);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reports" });
    }
});

// Assign report to organization
router.post("/:id/assign", async (req, res) => {
    const reportId = req.params.id;
    const { organizationId } = req.body;

    if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
    }

    try {
        const updatedReport = await storage.assignReportToOrganization(reportId, organizationId);

        if (!updatedReport) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json(updatedReport);
    } catch (error) {
        res.status(500).json({ message: "Failed to assign report" });
    }
});

export default router;
