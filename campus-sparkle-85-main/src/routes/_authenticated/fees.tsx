import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, StatCard } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateRecordDialog } from "@/components/create-record-dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/fees")({
  component: FeesPage,
});

function FeesPage() {
  const { data: payments } = useQuery({
    queryKey: ["fee-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fee_payments")
        .select("*, students(roll_number,full_name), fee_structures(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: students } = useQuery({
    queryKey: ["students-simple"],
    queryFn: async () => (await supabase.from("students").select("id,roll_number,full_name")).data ?? [],
  });
  const { data: structures } = useQuery({
    queryKey: ["fee-structures"],
    queryFn: async () => (await supabase.from("fee_structures").select("*").order("name")).data ?? [],
  });

  const total = (payments ?? []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
  const paid = (payments ?? []).reduce((s: number, r: any) => s + Number(r.paid_amount || 0), 0);

  return (
    <div>
      <PageHeader title="Fees" description="Structures, payments, and receipts."
        action={
          <CreateRecordDialog table="fee_payments" title="Record payment" invalidateKey={["fee-payments"]}
            fields={[
              { name: "student_id", label: `Student ID (${(students ?? []).slice(0,3).map((s: any) => `${s.roll_number}=${s.id.slice(0,8)}…`).join(", ") || "add students first"})`, required: true },
              { name: "fee_structure_id", label: `Fee structure ID (${(structures ?? []).slice(0,3).map((s: any) => `${s.name}=${s.id.slice(0,8)}…`).join(", ")})` },
              { name: "amount", label: "Amount", type: "number", required: true },
              { name: "paid_amount", label: "Paid amount", type: "number" },
              { name: "payment_method", label: "Method", placeholder: "cash / upi / card" },
              { name: "transaction_id", label: "Transaction ID" },
              { name: "receipt_number", label: "Receipt #" },
            ]}
            transform={(v) => ({
              ...v,
              amount: Number(v.amount),
              paid_amount: v.paid_amount ? Number(v.paid_amount) : 0,
              status: v.paid_amount && Number(v.paid_amount) >= Number(v.amount) ? "paid" : (Number(v.paid_amount || 0) > 0 ? "partial" : "pending"),
              paid_on: v.paid_amount && Number(v.paid_amount) > 0 ? new Date().toISOString() : null,
              fee_structure_id: v.fee_structure_id || null,
            })}
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Total billed" value={`₹${total.toLocaleString()}`} />
        <StatCard icon={CheckCircle2} label="Collected" value={`₹${paid.toLocaleString()}`} tone="success" />
        <StatCard icon={AlertCircle} label="Outstanding" value={`₹${(total - paid).toLocaleString()}`} tone="destructive" />
      </div>

      <Card className="mb-4 border-border/70 shadow-elegant">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">Fee structures</h3>
            <CreateRecordDialog
              table="fee_structures" title="New fee structure" invalidateKey={["fee-structures"]}
              fields={[
                { name: "name", label: "Name", required: true, placeholder: "Sem 1 tuition" },
                { name: "amount", label: "Amount", type: "number", required: true },
                { name: "semester", label: "Semester", type: "number" },
                { name: "academic_year", label: "Academic year", placeholder: "2025-2026" },
              ]}
              transform={(v) => ({ ...v, amount: Number(v.amount), semester: v.semester ? Number(v.semester) : null })}
            />
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Amount</TableHead><TableHead>Sem</TableHead><TableHead>Year</TableHead></TableRow></TableHeader>
            <TableBody>
              {(structures ?? []).map((f: any) => (
                <TableRow key={f.id}>
                  <TableCell>{f.name}</TableCell>
                  <TableCell>₹{Number(f.amount).toLocaleString()}</TableCell>
                  <TableCell>{f.semester ?? "—"}</TableCell>
                  <TableCell>{f.academic_year ?? "—"}</TableCell>
                </TableRow>
              ))}
              {(structures ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">No structures yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-elegant">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments ?? []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.receipt_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{p.students?.full_name} <span className="text-muted-foreground">({p.students?.roll_number})</span></TableCell>
                  <TableCell>{p.fee_structures?.name ?? "—"}</TableCell>
                  <TableCell>₹{Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(p.paid_amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={p.status === "paid" ? "default" : p.status === "partial" ? "secondary" : "destructive"} className="capitalize">{p.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{p.paid_on ? format(new Date(p.paid_on), "PP") : "—"}</TableCell>
                </TableRow>
              ))}
              {(payments ?? []).length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No payments recorded.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
