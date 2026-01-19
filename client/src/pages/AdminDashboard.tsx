import { useState } from "react";
import { LayoutDashboard, Search, Eye, Building2, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw, Brain, Loader2, X, FileDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  });

  const handleRunAnalysis = (org: Organization) => {
    setSelectedOrg(org);
    setAnalysisResult(null);
    setIsAnalysisModalOpen(true);
    analyzeMutation.mutate(org.id);
  };

  const closeAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setSelectedOrg(null);
    setAnalysisResult(null);
    refetch();
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-admin-title">
                Arica Toucan Admin
              </h1>
              <p className="text-sm text-muted-foreground">Overview of Scanned Organizations</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Organizations"
            value={stats.total}
            icon={Building2}
            iconColor="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            title="Fully Compliant"
            value={stats.compliant}
            icon={CheckCircle2}
            iconColor="text-green-600 dark:text-green-400"
            bgColor="bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            title="Partial Compliance"
            value={stats.partial}
            icon={TrendingUp}
            iconColor="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            title="Critical Gaps"
            value={stats.critical}
            icon={AlertTriangle}
            iconColor="text-red-600 dark:text-red-400"
            bgColor="bg-red-100 dark:bg-red-900/30"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Organizations</CardTitle>
                <CardDescription>
                  {filteredOrgs.length} organization{filteredOrgs.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                  data-testid="input-search"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Organization Name</TableHead>
                      <TableHead>Compliance Score</TableHead>
                      <TableHead>Last Scan Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrgs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No organizations found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrgs.map((org) => (
                        <TableRow key={org.id} className="hover-elevate" data-testid={`row-org-${org.id}`}>
                          <TableCell className="pl-6 font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              {org.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    org.complianceScore >= 80 ? "bg-green-500" :
                                    org.complianceScore >= 60 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${org.complianceScore}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{org.complianceScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {org.lastScanDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                org.status === "Compliant"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : org.status === "Partial"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }
                            >
                              {org.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
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
                                className="gap-1.5 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 transition-colors"
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
                                className="gap-1.5"
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

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border text-center">
          <p className="text-sm text-muted-foreground">
            Average Compliance Score: <span className="font-semibold text-foreground">{stats.avgScore}%</span>
          </p>
        </div>
      </div>

      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Compliance Analysis
            </DialogTitle>
            <DialogDescription>
              {selectedOrg ? `Analysis for ${selectedOrg.name}` : 'Loading...'}
            </DialogDescription>
          </DialogHeader>

          {analyzeMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing compliance data with AI...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          ) : analyzeMutation.isError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="text-red-600 font-medium">Analysis Failed</p>
              <p className="text-sm text-muted-foreground text-center">
                {analyzeMutation.error instanceof Error ? analyzeMutation.error.message : 'An error occurred'}
              </p>
              <Button variant="outline" onClick={() => selectedOrg && analyzeMutation.mutate(selectedOrg.id)}>
                Retry Analysis
              </Button>
            </div>
          ) : analysisResult ? (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall AI Score</p>
                    <p className="text-3xl font-bold text-primary">{analysisResult.overallScore}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Analyzed</p>
                    <p className="text-sm font-medium">{new Date(analysisResult.analyzedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Compliance Gaps ({analysisResult.gaps.length})
                  </h3>
                  {analysisResult.gaps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No gaps identified</p>
                  ) : (
                    <div className="space-y-2">
                      {analysisResult.gaps.map((gap, index) => (
                        <div key={index} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{gap.control}</p>
                              <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={
                                gap.severity === 'High'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : gap.severity === 'Medium'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }
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
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Recommended Remedies ({analysisResult.remedies.length})
                  </h3>
                  {analysisResult.remedies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No remedies needed</p>
                  ) : (
                    <div className="space-y-2">
                      {analysisResult.remedies.map((remedy, index) => (
                        <div key={index} className="p-3 rounded-lg border bg-card">
                          <p className="font-medium text-sm">{remedy.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">Timeline: {remedy.timeline}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Step-by-Step Plan ({analysisResult.stepByStepPlan.length} steps)
                  </h3>
                  {analysisResult.stepByStepPlan.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No steps defined</p>
                  ) : (
                    <ol className="space-y-2">
                      {analysisResult.stepByStepPlan.map((step, index) => (
                        <li key={index} className="flex gap-3 p-3 rounded-lg border bg-card">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </ScrollArea>
          ) : null}

          <div className="flex justify-end gap-2 pt-4 border-t">
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
            <Button variant="outline" onClick={closeAnalysisModal}>
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${bgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
