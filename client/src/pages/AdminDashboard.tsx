import { useState } from "react";
import { LayoutDashboard, Search, Eye, Building2, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw, Brain, Loader2, X, FileDown, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { fetchWithAuth } from "@/lib/api";
import type { Organization } from "@shared/schema";

interface AnalysisResult {
  overallScore: number;
  gaps: Array<{ control: string; description: string; severity: 'High' | 'Medium' | 'Low' }>;
  remedies: Array<{ action: string; timeline: string }>;
  stepByStepPlan: string[];
  analyzedAt: string;
}

const mockOrganizations: Organization[] = [
  { id: "1", name: "TechNova Solutions", complianceScore: 84, lastScanDate: "2026-01-15", status: "Partial" },
  { id: "2", name: "FinSecure Pvt Ltd", complianceScore: 62, lastScanDate: "2026-01-10", status: "Critical Gaps" },
  { id: "3", name: "HealthFirst Corp", complianceScore: 91, lastScanDate: "2026-01-18", status: "Compliant" },
  { id: "4", name: "RetailMax Inc", complianceScore: 73, lastScanDate: "2026-01-12", status: "Partial" },
  { id: "5", name: "CloudSync Systems", complianceScore: 45, lastScanDate: "2026-01-08", status: "Critical Gaps" },
  { id: "6", name: "DataGuard Solutions", complianceScore: 88, lastScanDate: "2026-01-17", status: "Compliant" },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations, isLoading, refetch, isRefetching } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
    initialData: mockOrganizations,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await fetchWithAuth(`/api/analyze/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze organization');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.data);
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({
        title: "Analysis Complete",
        description: "AI compliance analysis has been completed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze organization",
        variant: "destructive",
      });
    },
  });

  const pdfMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await fetchWithAuth(`/api/report/pdf/${orgId}`);
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to generate PDF');
        }
        throw new Error('Failed to generate PDF report');
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/pdf')) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${orgId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true, direct: true };
      }
      
      const data = await response.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated",
        description: "Compliance report has been downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF report",
        variant: "destructive",
      });
    },
  });

  const handleRunAnalysis = (org: Organization) => {
    setSelectedOrg(org);
    setAnalysisResult(null);
    setIsAnalysisModalOpen(true);
    analyzeMutation.mutate(org.id);
  };

  const handleViewOrganization = (org: Organization) => {
    // Navigate to report preview with organization context
    setLocation(`/report-preview?orgId=${org.id}&orgName=${encodeURIComponent(org.name)}`);
  };

  const handleNewAssessment = () => {
    setLocation('/questionnaire/user');
  };

  const closeAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setSelectedOrg(null);
    setAnalysisResult(null);
    refetch();
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Organization data has been updated.",
    });
  };

  const filteredOrgs = organizations?.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const stats = {
    total: organizations?.length || 0,
    compliant: organizations?.filter((o) => o.status === "Compliant").length || 0,
    partial: organizations?.filter((o) => o.status === "Partial").length || 0,
    critical: organizations?.filter((o) => o.status === "Critical Gaps").length || 0,
    avgScore: organizations?.length
      ? Math.round(organizations.reduce((sum, o) => sum + o.complianceScore, 0) / organizations.length)
      : 0,
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-cyber shadow-2xl shadow-primary/20 animate-float">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="text-admin-title">
                <span className="text-gradient">Arica Toucan</span> Admin
              </h1>
              <p className="text-lg text-muted-foreground font-medium">Overview of Scanned Organizations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="gradient"
              onClick={handleNewAssessment}
              className="gap-2"
              data-testid="button-new-assessment"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Organizations"
            value={stats.total}
            icon={Building2}
            iconColor="text-primary"
            bgColor="bg-gradient-cyber"
          />
          <StatCard
            title="Fully Compliant"
            value={stats.compliant}
            icon={CheckCircle2}
            iconColor="text-white"
            bgColor="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatCard
            title="Partial Compliance"
            value={stats.partial}
            icon={TrendingUp}
            iconColor="text-white"
            bgColor="bg-gradient-to-r from-amber-500 to-amber-600"
          />
          <StatCard
            title="Critical Gaps"
            value={stats.critical}
            icon={AlertTriangle}
            iconColor="text-white"
            bgColor="bg-gradient-to-r from-red-500 to-red-600"
          />
        </div>

        <Card className="border-gradient shadow-2xl shadow-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Organizations</CardTitle>
                <CardDescription className="text-base">
                  {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[300px] h-11 border-2 focus:border-primary/50 transition-all duration-200"
                  data-testid="input-search"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2">
                      <TableHead className="pl-6 font-semibold">Organization Name</TableHead>
                      <TableHead className="font-semibold">Compliance Score</TableHead>
                      <TableHead className="font-semibold">Last Scan Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrgs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-3">
                            <Building2 className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No organizations found</p>
                            <p className="text-sm">Try adjusting your search criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrgs.map((org, index) => (
                        <TableRow 
                          key={org.id} 
                          className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-200 border-b motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-4 motion-safe:duration-300" 
                          style={{ animationDelay: `${index * 50}ms` }}
                          data-testid={`row-org-${org.id}`}
                        >
                          <TableCell className="pl-6 font-medium">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center shadow-lg">
                                <Building2 className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-semibold text-lg">{org.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-3 rounded-full bg-muted overflow-hidden shadow-inner">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    org.complianceScore >= 80 ? "bg-gradient-to-r from-green-500 to-green-600" :
                                    org.complianceScore >= 60 ? "bg-gradient-to-r from-amber-500 to-amber-600" : 
                                    "bg-gradient-to-r from-red-500 to-red-600"
                                  }`}
                                  style={{ width: `${org.complianceScore}%` }}
                                />
                              </div>
                              <span className="text-base font-bold">{org.complianceScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {org.lastScanDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`font-semibold px-3 py-1 ${
                                org.status === "Compliant"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
                                  : org.status === "Partial"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
                              }`}
                            >
                              {org.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
                                onClick={() => handleRunAnalysis(org)}
                                disabled={analyzeMutation.isPending}
                                data-testid={`button-analyze-${org.id}`}
                              >
                                <Brain className="h-4 w-4" />
                                AI Analysis
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-900/20 transition-all duration-200"
                                onClick={() => pdfMutation.mutate(org.id)}
                                disabled={pdfMutation.isPending}
                                data-testid={`button-pdf-${org.id}`}
                              >
                                {pdfMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <FileDown className="h-4 w-4" />
                                )}
                                PDF
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                                onClick={() => handleViewOrganization(org)}
                                data-testid={`button-view-${org.id}`}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-6 rounded-2xl bg-gradient-subtle border-gradient text-center shadow-lg">
          <p className="text-lg text-muted-foreground">
            Average Compliance Score: <span className="font-bold text-2xl text-gradient ml-2">{stats.avgScore}%</span>
          </p>
        </div>
      </div>

      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] border-gradient">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-cyber flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              AI Compliance Analysis
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedOrg ? `Analysis for ${selectedOrg.name}` : 'Loading...'}
            </DialogDescription>
          </DialogHeader>

          {analyzeMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-cyber flex items-center justify-center animate-pulse-glow">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground mb-2">Analyzing compliance data with AI...</p>
                <p className="text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          ) : analyzeMutation.isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600 mb-2">Analysis Failed</p>
                <p className="text-muted-foreground mb-4">
                  {analyzeMutation.error instanceof Error ? analyzeMutation.error.message : 'An error occurred'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => selectedOrg && analyzeMutation.mutate(selectedOrg.id)}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Analysis
                </Button>
              </div>
            </div>
          ) : analysisResult ? (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-cyber text-white shadow-xl">
                  <div>
                    <p className="text-white/80 font-medium">Overall AI Score</p>
                    <p className="text-4xl font-bold">{analysisResult.overallScore}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 font-medium">Analyzed</p>
                    <p className="font-semibold">{new Date(analysisResult.analyzedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Compliance Gaps ({analysisResult.gaps.length})
                  </h3>
                  {analysisResult.gaps.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-green-600">No gaps identified</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysisResult.gaps.map((gap, index) => (
                        <div key={index} className="p-4 rounded-xl border-gradient bg-gradient-subtle shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-semibold text-base mb-2">{gap.control}</p>
                              <p className="text-muted-foreground">{gap.description}</p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`font-semibold ${
                                gap.severity === 'High'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : gap.severity === 'Medium'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}
                            >
                              {gap.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Recommended Remedies ({analysisResult.remedies.length})
                  </h3>
                  {analysisResult.remedies.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-green-600">No remedies needed</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysisResult.remedies.map((remedy, index) => (
                        <div key={index} className="p-4 rounded-xl border-gradient bg-gradient-subtle shadow-sm">
                          <p className="font-semibold text-base mb-2">{remedy.action}</p>
                          <p className="text-sm text-muted-foreground">Timeline: {remedy.timeline}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Step-by-Step Plan ({analysisResult.stepByStepPlan.length} steps)
                  </h3>
                  {analysisResult.stepByStepPlan.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
                      <p className="text-lg font-semibold text-primary">No steps defined</p>
                    </div>
                  ) : (
                    <ol className="space-y-3">
                      {analysisResult.stepByStepPlan.map((step, index) => (
                        <li key={index} className="flex gap-4 p-4 rounded-xl border-gradient bg-gradient-subtle shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-cyber text-white text-sm font-bold flex items-center justify-center shadow-lg">
                            {index + 1}
                          </span>
                          <span className="text-base font-medium">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </ScrollArea>
          ) : null}

          <div className="flex justify-end gap-3 pt-6 border-t">
            {selectedOrg && analysisResult && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => pdfMutation.mutate(selectedOrg.id)}
                disabled={pdfMutation.isPending}
              >
                {pdfMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Download PDF Report
              </Button>
            )}
            <Button variant="gradient" onClick={closeAnalysisModal}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <Card className="border-gradient hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 group">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${bgColor} shadow-lg group-hover:animate-pulse-glow transition-all duration-300`}>
            <Icon className={`h-7 w-7 ${iconColor}`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
