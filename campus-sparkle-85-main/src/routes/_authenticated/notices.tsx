import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateRecordDialog } from "@/components/create-record-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/notices")({
  component: NoticesPage,
});

function NoticesPage() {
  const { data } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Notice Board" description="Circulars, holidays, exam & placement notices."
        action={
          <CreateRecordDialog table="notices" title="Post notice" invalidateKey={["notices"]}
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "body", label: "Body", required: true },
              { name: "category", label: "Category", placeholder: "general / exam / holiday / placement" },
              { name: "audience", label: "Audience", placeholder: "all / students / faculty" },
            ]}
            transform={(v) => ({ category: v.category || "general", audience: v.audience || "all", ...v })}
          />
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((n: any) => (
          <Card key={n.id} className="border-border/70 bg-gradient-card shadow-elegant">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="font-display">{n.title}</CardTitle>
                <Badge variant="secondary" className="capitalize">{n.category}</Badge>
              </div>
              <CardDescription>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })} · to {n.audience}</CardDescription>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">{n.body}</CardContent>
          </Card>
        ))}
        {(data ?? []).length === 0 && (
          <Card className="col-span-full border-dashed"><CardContent className="py-10 text-center text-muted-foreground">No notices posted yet.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
