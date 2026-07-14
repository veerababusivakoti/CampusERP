import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateRecordDialog } from "@/components/create-record-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/faculty")({
  component: FacultyPage,
});

function FacultyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faculty").select("*, departments(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader
        title="Faculty"
        description="Teaching staff across departments."
        action={
          <CreateRecordDialog
            table="faculty" title="Add faculty" invalidateKey={["faculty"]}
            fields={[
              { name: "full_name", label: "Full name", required: true },
              { name: "employee_id", label: "Employee ID", required: true },
              { name: "email", label: "Email", type: "email" },
              { name: "phone", label: "Phone" },
              { name: "designation", label: "Designation" },
              { name: "qualification", label: "Qualification" },
              { name: "experience_years", label: "Experience (years)", type: "number" },
            ]}
            transform={(v) => ({ ...v, experience_years: v.experience_years ? Number(v.experience_years) : 0 })}
          />
        }
      />

      <Card className="border-border/70 bg-card shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Exp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>}
              {!isLoading && (data ?? []).length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No faculty yet.</TableCell></TableRow>
              )}
              {(data ?? []).map((f: any) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">{f.employee_id}</TableCell>
                  <TableCell className="font-medium">{f.full_name}</TableCell>
                  <TableCell>{f.designation ?? "—"}</TableCell>
                  <TableCell>{f.departments?.name ?? "—"}</TableCell>
                  <TableCell>{f.qualification ?? "—"}</TableCell>
                  <TableCell>{f.experience_years ?? 0} yrs</TableCell>
                  <TableCell><Badge variant={f.status === "active" ? "default" : "secondary"}>{f.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
