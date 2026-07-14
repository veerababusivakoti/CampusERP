import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateRecordDialog } from "@/components/create-record-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/assignments")({
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { data } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assignments").select("*, subjects(name,code)").order("created_at", { ascending: false });
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
      <PageHeader title="Assignments" description="Post assignments and track submissions."
        action={
          <CreateRecordDialog table="assignments" title="New assignment" invalidateKey={["assignments"]}
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "description", label: "Description" },
              { name: "due_date", label: "Due date", type: "date" },
              { name: "max_marks", label: "Max marks", type: "number", placeholder: "100" },
              { name: "subject_id", label: `Subject ID (${(subjects ?? []).map((s: any) => `${s.code}=${s.id.slice(0,8)}…`).join(", ") || "create a subject first"})`, required: true },
              { name: "file_url", label: "File URL (optional)" },
            ]}
            transform={(v) => ({ ...v, max_marks: v.max_marks ? Number(v.max_marks) : 100 })}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((a: any) => (
          <Card key={a.id} className="border-border/70 bg-gradient-card shadow-elegant">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="font-display text-lg">{a.title}</CardTitle>
                  <CardDescription>{a.subjects?.code} · {a.subjects?.name}</CardDescription>
                </div>
                <Badge variant="secondary">/{a.max_marks}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {a.description || "No description."}
              {a.due_date && <p className="mt-3 text-xs">Due: <span className="font-medium text-foreground">{format(new Date(a.due_date), "PP")}</span></p>}
            </CardContent>
          </Card>
        ))}
        {(data ?? []).length === 0 && (
          <Card className="col-span-full border-dashed"><CardContent className="py-10 text-center text-muted-foreground">No assignments yet.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
