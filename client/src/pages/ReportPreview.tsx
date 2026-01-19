import { BarChart3, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Shield, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const complianceData = [
  { name: "Compliant", value: 78, color: "hsl(142, 71%, 45%)" },
  { name: "Gaps", value: 22, color: "hsl(0, 84%, 60%)" },
];

const strengths = [
  "Strong access control policies in place",
  "Regular security awareness training conducted",
  "Documented incident response procedures",
  "Asset inventory maintained and updated",
];

const gaps = [
  { area: "Data Encryption", severity: "High", description: "Encryption at rest not fully implemented" },
  { area: "Backup Testing", severity: "Medium", description: "Backup recovery procedures not tested in 6 months" },
  { area: "Vendor Assessment", severity: "Low", description: "Third-party vendor security assessments pending" },
];

const remedies = [
  { step: 1, title: "Implement Full Disk Encryption", timeline: "2 weeks", priority: "High" },
  { step: 2, title: "Conduct Backup Recovery Drill", timeline: "1 week", priority: "Medium" },
  { step: 3, title: "Complete Vendor Security Assessments", timeline: "4 weeks", priority: "Low" },
  { step: 4, title: "Update Security Policies Documentation", timeline: "2 weeks", priority: "Medium" },
];

export default function ReportPreview() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-report-title">
            ISO Compliance Report Preview
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A comprehensive overview of your organization&apos;s ISO 27001/27002 compliance status.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${78 * 3.52} ${100 * 3.52}`}
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute text-4xl font-bold text-foreground" data-testid="text-compliance-score">78%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">Overall Compliance</p>
                <Badge className="mt-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Partial Compliance
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Compliance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Strengths
              </CardTitle>
              <CardDescription>Areas where your organization excels</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Gaps Identified
              </CardTitle>
              <CardDescription>Areas requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {gaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                    <XCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
                      gap.severity === "High" ? "text-red-500" :
                      gap.severity === "Medium" ? "text-amber-500" : "text-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{gap.area}</span>
                        <Badge
                          variant="secondary"
                          className={
                            gap.severity === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                            gap.severity === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }
                        >
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recommended Remedies &amp; Steps to Compliance
            </CardTitle>
            <CardDescription>Follow these steps to achieve full ISO 27001/27002 compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {remedies.map((remedy) => (
                <div key={remedy.step} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover-elevate">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    {remedy.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground">{remedy.title}</h4>
                      <Badge
                        variant="outline"
                        className={
                          remedy.priority === "High" ? "border-red-500 text-red-600 dark:text-red-400" :
                          remedy.priority === "Medium" ? "border-amber-500 text-amber-600 dark:text-amber-400" :
                          "border-blue-500 text-blue-600 dark:text-blue-400"
                        }
                      >
                        {remedy.priority} Priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">Timeline: {remedy.timeline}</span>
                      <Progress value={0} className="flex-1 h-1.5 max-w-[200px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button className="gap-2" data-testid="button-download-report">
            Download Full Report
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" data-testid="button-schedule-consultation">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}
