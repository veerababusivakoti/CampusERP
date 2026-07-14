import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateRecordDialog } from "@/components/create-record-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/exams")({
  component: ExamsPage,
});

function ExamsPage() {
  const { data } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("exams").select("*, subjects(name,code)").order("exam_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: subjects } = useQuery({
    queryKey: ["subjects-simple"],
    queryFn: async () => (await supabase.from("subjects").select("id,name,code")).data ?? [],
  });

  return (
    <div>
      <PageHeader title="Exams" description="Schedule internal and semester examinations."
        action={
          <CreateRecordDialog table="exams" title="New exam" invalidateKey={["exams"]}
            fields={[
              { name: "name", label: "Name", required: true, placeholder: "Mid-term 1" },
              { name: "exam_type", label: "Type (internal / semester)", placeholder: "internal" },
              { name: "exam_date", label: "Date", type: "date" },
              { name: "max_marks", label: "Max marks", type: "number", placeholder: "100" },
              { name: "subject_id", label: `Subject ID (${(subjects ?? []).map((s: any) => `${s.code}=${s.id.slice(0,8)}…`).join(", ") || "create a subject first"})`, required: true },
            ]}
            transform={(v) => ({ ...v, max_marks: v.max_marks ? Number(v.max_marks) : 100, exam_type: v.exam_type || "internal" })}
          />
        }
      />
      <Card className="border-border/70 shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.subjects?.code} — {e.subjects?.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{e.exam_type}</Badge></TableCell>
                  <TableCell>{e.exam_date ? format(new Date(e.exam_date), "PP") : "—"}</TableCell>
                  <TableCell>{e.max_marks}</TableCell>
                </TableRow>
              ))}
              {(data ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No exams scheduled.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
