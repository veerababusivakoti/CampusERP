import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CreateRecordDialog } from "@/components/create-record-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/students")({
  component: StudentsPage,
});

function StudentsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, departments(name), courses(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((s: any) =>
    !q || s.full_name?.toLowerCase().includes(q.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(q.toLowerCase()) ||
    s.email?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Students"
        description="All enrolled students. Admins & HODs can add or edit records."
        action={
          <CreateRecordDialog
            table="students"
            title="Add student"
            description="Create a new student record."
            invalidateKey={["students"]}
            fields={[
              { name: "full_name", label: "Full name", required: true },
              { name: "roll_number", label: "Roll number", required: true },
              { name: "email", label: "Email", type: "email" },
              { name: "phone", label: "Phone" },
              { name: "semester", label: "Semester", type: "number" },
              { name: "section", label: "Section" },
              { name: "guardian_name", label: "Guardian name" },
              { name: "guardian_phone", label: "Guardian phone" },
            ]}
            transform={(v) => ({ ...v, semester: v.semester ? Number(v.semester) : 1 })}
          />
        }
      />

      <div className="mb-4 flex gap-2">
        <Input placeholder="Search by name, roll number, email…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </div>

      <Card className="border-border/70 bg-card shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No students yet. Click “New” to add one.</TableCell></TableRow>
              )}
              {filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.roll_number}</TableCell>
                  <TableCell className="font-medium">{s.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                  <TableCell>{s.departments?.name ?? "—"}</TableCell>
                  <TableCell>{s.semester}</TableCell>
                  <TableCell>{s.section}</TableCell>
                  <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
