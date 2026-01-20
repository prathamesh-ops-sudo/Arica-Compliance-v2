import { useQuery, useMutation } from "@tanstack/react-query";
import { Report, Organization } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function IncomingReports() {
    const { toast } = useToast();

    const { data: reports, isLoading: isLoadingReports } = useQuery<Report[]>({
        queryKey: ["/api/agent/unassigned"],
    });

    const { data: organizations } = useQuery<Organization[]>({
        queryKey: ["/api/organizations"],
    });

    const assignMutation = useMutation({
        mutationFn: async ({ reportId, organizationId }: { reportId: string; organizationId: string }) => {
            await apiRequest("POST", `/api/agent/${reportId}/assign`, { organizationId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/agent/unassigned"] });
            toast({
                title: "Report Assigned",
                description: "The report has been successfully assigned to the organization.",
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Assignment Failed",
                description: "Failed to assign report.",
            });
        },
    });

    if (isLoadingReports) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Incoming Desktop Agent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hostname</TableHead>
                                <TableHead>User Type</TableHead>
                                <TableHead>Received At</TableHead>
                                <TableHead>Antivirus Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No new reports pending assignment.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports?.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>{report.hostname}</TableCell>
                                        <TableCell className="capitalize">{report.userType}</TableCell>
                                        <TableCell>{new Date(report.createdAt!).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {/* Parsing scanData safely */}
                                            {(() => {
                                                try {
                                                    const scanData = JSON.parse(report.scanData);
                                                    return scanData.antivirus?.status === "active" ? (
                                                        <span className="text-green-600 font-medium">Active</span>
                                                    ) : (
                                                        <span className="text-red-600 font-medium">Inactive/Unknown</span>
                                                    );
                                                } catch (e) {
                                                    return "Error parsing";
                                                }
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <AssignmentCell
                                                report={report}
                                                organizations={organizations || []}
                                                onAssign={(orgId) => assignMutation.mutate({ reportId: report.id, organizationId: orgId })}
                                                isPending={assignMutation.isPending}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function AssignmentCell({ report, organizations, onAssign, isPending }: { report: Report, organizations: Organization[], onAssign: (id: string) => void, isPending: boolean }) {
    const [selectedOrg, setSelectedOrg] = useState<string>("");

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                    {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                            {org.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
                size="sm"
                disabled={!selectedOrg || isPending}
                onClick={() => onAssign(selectedOrg)}
            >
                Assign
            </Button>
        </div>
    );
}
