import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Shield, TrendingUp, FileText, Building2, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orgContext, setOrgContext] = useState<{ id?: string; name?: string }>({});

  useEffect(() => {
    // Parse URL parameters to get organization context
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('orgId');
    const orgName = urlParams.get('orgName');
    
    if (orgId && orgName) {
      setOrgContext({ id: orgId, name: decodeURIComponent(orgName) });
    }
  }, []);

  const handleDownloadReport = () => {
    toast({
      title: "Downloading Report",
      description: "Your compliance report is being prepared for download.",
    });
    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Your compliance report has been downloaded successfully.",
      });
    }, 2000);
  };

  const handleScheduleConsultation = () => {
    toast({
      title: "Consultation Requested",
      description: "We'll contact you within 24 hours to schedule your consultation.",
    });
  };

  const handleBackToDashboard = () => {
    setLocation('/admin/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-cyber mb-6 shadow-2xl shadow-primary/20 animate-float">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-report-title">
            <span className="text-gradient">ISO Compliance Report</span>
            {orgContext.name && (
              <div className="text-2xl md:text-3xl font-semibold text-foreground mt-2">
                {orgContext.name}
              </div>
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            A comprehensive overview of your organization's ISO 27001/27002 compliance status.
          </p>
          {orgContext.id && (
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="mt-4 gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Dashboard
            </Button>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-8">
          <Card className="md:col-span-1 border-gradient shadow-2xl shadow-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-4 motion-safe:duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3 font-bold">
                <Shield className="h-6 w-6 text-primary" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted/30"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${78 * 4.02} ${100 * 4.02}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-5xl font-bold text-gradient" data-testid="text-compliance-score">78%</span>
                </div>
                <p className="text-base text-muted-foreground mb-3 font-medium">Overall Compliance</p>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-1 text-sm font-semibold">
                  Partial Compliance
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-gradient shadow-2xl shadow-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-4 motion-safe:duration-500 motion-safe:delay-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-3 font-bold">
                <TrendingUp className="h-6 w-6 text-primary" />
                Compliance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
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
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <Card className="border-gradient shadow-2xl shadow-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-4 motion-safe:duration-500 motion-safe:delay-300">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 font-bold">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                Strengths
              </CardTitle>
              <CardDescription className="text-base">Areas where your organization excels</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-4 p-3 rounded-xl bg-gradient-subtle">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <span className="text-base text-foreground font-medium">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gradient shadow-2xl shadow-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-4 motion-safe:duration-500 motion-safe:delay-400">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 font-bold">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                Gaps Identified
              </CardTitle>
              <CardDescription className="text-base">Areas requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {gaps.map((gap, index) => (
                  <li key={index} className="flex items-start gap-4 p-4 rounded-xl border-gradient bg-gradient-subtle">
                    <XCircle className={`h-6 w-6 shrink-0 mt-0.5 ${
                      gap.severity === "High" ? "text-red-500" :
                      gap.severity === "Medium" ? "text-amber-500" : "text-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-base text-foreground">{gap.area}</span>
                        <Badge
                          variant="secondary"
                          className={`font-semibold ${
                            gap.severity === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                            gap.severity === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{gap.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-gradient shadow-2xl shadow-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3 font-bold">
              <FileText className="h-7 w-7 text-primary" />
              Recommended Remedies & Steps to Compliance
            </CardTitle>
            <CardDescription className="text-base">Follow these steps to achieve full ISO 27001/27002 compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {remedies.map((remedy, index) => (
                <div key={remedy.step} className="flex items-start gap-6 p-6 rounded-2xl border-gradient bg-gradient-subtle hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-cyber text-white font-bold shrink-0 shadow-lg">
                    {remedy.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                      <h4 className="font-bold text-lg text-foreground">{remedy.title}</h4>
                      <Badge
                        variant="outline"
                        className={`font-semibold px-3 py-1 ${
                          remedy.priority === "High" ? "border-red-500 text-red-600 dark:text-red-400" :
                          remedy.priority === "Medium" ? "border-amber-500 text-amber-600 dark:text-amber-400" :
                          "border-blue-500 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {remedy.priority} Priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-base text-muted-foreground font-medium">Timeline: {remedy.timeline}</span>
                      <Progress value={0} className="flex-1 h-2 max-w-[300px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-600">
          <Button 
            variant="gradient" 
            size="lg" 
            className="gap-3 min-w-[200px]" 
            onClick={handleDownloadReport}
            data-testid="button-download-report"
          >
            <Download className="h-5 w-5" />
            Download Full Report
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="min-w-[200px]" 
            onClick={handleScheduleConsultation}
            data-testid="button-schedule-consultation"
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}
