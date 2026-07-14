import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateRecordDialog } from "@/components/create-record-dialog";

export const Route = createFileRoute("/_authenticated/subjects")({
  component: SubjectsPage,
});

function SubjectsPage() {
  const { data } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*, courses(name,code)").order("semester");
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: courses } = useQuery({
    queryKey: ["courses-simple"],
    queryFn: async () => (await supabase.from("courses").select("id,name,code")).data ?? [],
  });

  return (
    <div>
      <PageHeader title="Subjects"
        action={
          <CreateRecordDialog table="subjects" title="New subject" invalidateKey={["subjects"]}
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "code", label: "Code", required: true },
              { name: "credits", label: "Credits", type: "number", placeholder: "3" },
              { name: "semester", label: "Semester", type: "number", placeholder: "1", required: true },
              { name: "course_id", label: `Course ID (${(courses ?? []).map((c: any) => `${c.code}=${c.id.slice(0,8)}…`).join(", ") || "create a course first"})`, required: true },
            ]}
            transform={(v) => ({ ...v, credits: v.credits ? Number(v.credits) : 3, semester: Number(v.semester) })}
          />
        }
      />
      <Card className="border-border/70 shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Course</TableHead><TableHead>Sem</TableHead><TableHead>Credits</TableHead></TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.courses?.name ?? "—"}</TableCell>
                  <TableCell>{s.semester}</TableCell>
                  <TableCell>{s.credits}</TableCell>
                </TableRow>
              ))}
              {(data ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No subjects yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
