import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateRecordDialog } from "@/components/create-record-dialog";

export const Route = createFileRoute("/_authenticated/courses")({
  component: CoursesPage,
});

function CoursesPage() {
  const { data } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*, departments(name)").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: depts } = useQuery({
    queryKey: ["departments-simple"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("id,name,code");
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Courses"
        action={
          <CreateRecordDialog
            table="courses" title="New course" invalidateKey={["courses"]}
            fields={[
              { name: "name", label: "Name", required: true, placeholder: "B.Tech Computer Science" },
              { name: "code", label: "Code", required: true, placeholder: "BTCSE" },
              { name: "duration_years", label: "Duration (years)", type: "number", placeholder: "4" },
              { name: "department_id", label: `Department ID (${(depts ?? []).map((d: any) => `${d.code}=${d.id.slice(0,8)}…`).join(", ") || "create a department first"})`, required: true },
            ]}
            transform={(v) => ({ ...v, duration_years: v.duration_years ? Number(v.duration_years) : 4 })}
          />
        }
      />
      <Card className="border-border/70 shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Duration</TableHead></TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.departments?.name ?? "—"}</TableCell>
                  <TableCell>{c.duration_years} yrs</TableCell>
                </TableRow>
              ))}
              {(data ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No courses yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
