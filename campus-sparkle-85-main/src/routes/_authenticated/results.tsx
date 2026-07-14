import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/results")({
  component: ResultsPage,
});

function grade(pct: number): string {
  if (pct >= 90) return "O";
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  return "F";
}

function ResultsPage() {
  const { data } = useQuery({
    queryKey: ["marks-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marks")
        .select("marks_obtained, students(roll_number,full_name), exams(name, max_marks, subjects(code,name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Results" description="Marks & grades across exams." />
      <Card className="border-border/70 shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((m: any, i: number) => {
                const max = m.exams?.max_marks ?? 100;
                const pct = (Number(m.marks_obtained) / max) * 100;
                return (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{m.students?.roll_number}</TableCell>
                    <TableCell className="font-medium">{m.students?.full_name}</TableCell>
                    <TableCell>{m.exams?.subjects?.code}</TableCell>
                    <TableCell>{m.exams?.name}</TableCell>
                    <TableCell>{m.marks_obtained} / {max}</TableCell>
                    <TableCell>{pct.toFixed(1)}%</TableCell>
                    <TableCell><Badge variant={pct >= 40 ? "default" : "destructive"}>{grade(pct)}</Badge></TableCell>
                  </TableRow>
                );
              })}
              {(data ?? []).length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No marks entered yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
