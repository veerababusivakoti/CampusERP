import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateRecordDialog } from "@/components/create-record-dialog";

export const Route = createFileRoute("/_authenticated/departments")({
  component: DeptPage,
});

function DeptPage() {
  const { data } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader
        title="Departments"
        action={
          <CreateRecordDialog table="departments" title="New department" invalidateKey={["departments"]}
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "code", label: "Code", required: true, placeholder: "e.g. CSE" },
            ]}
          />
        }
      />
      <Card className="border-border/70 shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.code}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {(data ?? []).length === 0 && <TableRow><TableCell colSpan={3} className="py-10 text-center text-muted-foreground">No departments yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
