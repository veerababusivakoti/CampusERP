import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyRoles, hasAnyRole, TEACHING_ROLES } from "@/hooks/use-auth";

type Status = "present" | "absent" | "late" | "excused";

export const Route = createFileRoute("/_authenticated/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const qc = useQueryClient();
  const { data: roles } = useMyRoles();
  const canMark = hasAnyRole(roles, TEACHING_ROLES);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [subjectId, setSubjectId] = useState<string>("");
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const { data: subjects } = useQuery({
    queryKey: ["subjects-simple"],
    queryFn: async () => (await supabase.from("subjects").select("id,name,code").order("name")).data ?? [],
  });

  const { data: students } = useQuery({
    queryKey: ["students-simple"],
    queryFn: async () => (await supabase.from("students").select("id,roll_number,full_name").order("roll_number")).data ?? [],
  });

  const { data: existing } = useQuery({
    queryKey: ["attendance", date, subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("student_id,status").eq("date", date).eq("subject_id", subjectId);
      return data ?? [];
    },
  });

  useMemo(() => {
    const map: Record<string, Status> = {};
    (existing ?? []).forEach((r: any) => (map[r.student_id] = r.status));
    setMarks(map);
  }, [existing]);

  const save = useMutation({
    mutationFn: async () => {
      if (!subjectId) throw new Error("Pick a subject");
      const rows = (students ?? []).map((s: any) => ({
        student_id: s.id, subject_id: subjectId, date, status: (marks[s.id] ?? "present") as Status,
      }));
      const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,subject_id,date" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Attendance saved"); qc.invalidateQueries({ queryKey: ["attendance"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (id: string, s: Status) => setMarks((m) => ({ ...m, [id]: s }));

  return (
    <div>
      <PageHeader title="Attendance" description="Mark and review attendance by class and date." />

      <Card className="mb-4 border-border/70 shadow-elegant">
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue placeholder="Choose subject" /></SelectTrigger>
              <SelectContent>
                {(subjects ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => save.mutate()} disabled={!subjectId || save.isPending || !canMark}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(students ?? []).map((s: any) => {
                const cur = marks[s.id] ?? "present";
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {(["present", "absent", "late", "excused"] as Status[]).map((st) => (
                          <Button key={st} size="sm" variant={cur === st ? "default" : "outline"}
                            className={cn("h-8 capitalize", cur === st && st === "absent" && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                            onClick={() => set(s.id, st)} disabled={!canMark}>
                            {st === "present" && <Check className="mr-1 h-3.5 w-3.5" />}
                            {st === "absent" && <X className="mr-1 h-3.5 w-3.5" />}
                            {st === "late" && <Clock className="mr-1 h-3.5 w-3.5" />}
                            {st}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(students ?? []).length === 0 && <TableRow><TableCell colSpan={3} className="py-10 text-center text-muted-foreground">Add students first.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
