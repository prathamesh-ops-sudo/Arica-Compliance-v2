import { useState } from "react";
import { LayoutDashboard, Search, Eye, Building2, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Organization } from "@shared/schema";

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

  const { data: organizations, isLoading, refetch, isRefetching } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
    initialData: mockOrganizations,
  });

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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              data-testid={`button-view-${org.id}`}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
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
