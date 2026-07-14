import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard, PageHeader } from "@/components/page-header";
import { Users, GraduationCap, Building2, ClipboardCheck, Wallet, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { useMyRoles } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function useCount(table: string) {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table as never).select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function DashboardPage() {
  const { data: roles } = useMyRoles();
  const students = useCount("students");
  const faculty = useCount("faculty");
  const depts = useCount("departments");
  const subjects = useCount("subjects");

  const { data: attendance7 } = useQuery({
    queryKey: ["attendance-7d"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 6);
      const { data, error } = await supabase.from("attendance").select("date,status").gte("date", since.toISOString().slice(0, 10));
      if (error) throw error;
      const map = new Map<string, { date: string; present: number; absent: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const k = d.toISOString().slice(0, 10);
        map.set(k, { date: k.slice(5), present: 0, absent: 0 });
      }
      (data ?? []).forEach((r: any) => {
        const k = r.date;
        const row = map.get(k) || { date: k.slice(5), present: 0, absent: 0 };
        if (r.status === "present") row.present++; else if (r.status === "absent") row.absent++;
        map.set(k, row);
      });
      return Array.from(map.values());
    },
  });

  const { data: feeSummary } = useQuery({
    queryKey: ["fee-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fee_payments").select("status,amount,paid_amount");
      if (error) throw error;
      const rows = data ?? [];
      const total = rows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const paid = rows.reduce((s, r: any) => s + Number(r.paid_amount || 0), 0);
      return { total, paid, pending: total - paid };
    },
  });

  const { data: deptDist } = useQuery({
    queryKey: ["dept-dist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("department_id, departments(name)");
      if (error) throw error;
      const map = new Map<string, number>();
      (data ?? []).forEach((r: any) => {
        const name = r.departments?.name ?? "Unassigned";
        map.set(name, (map.get(name) ?? 0) + 1);
      });
      return Array.from(map, ([name, value]) => ({ name, value }));
    },
  });

  const roleLabel = roles?.[0]?.replace(/_/g, " ") ?? "user";
  const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back — signed in as ${roleLabel}.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Students" value={students.data ?? "—"} tone="primary" />
        <StatCard icon={GraduationCap} label="Faculty" value={faculty.data ?? "—"} tone="info" />
        <StatCard icon={Building2} label="Departments" value={depts.data ?? "—"} tone="success" />
        <StatCard icon={BookOpen} label="Subjects" value={subjects.data ?? "—"} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 bg-gradient-card shadow-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Attendance — last 7 days</CardTitle>
            <CardDescription>Present vs absent, all subjects.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendance7 ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="absent" stroke="var(--color-chart-4)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle className="font-display">Students by department</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptDist ?? []} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={2}>
                  {(deptDist ?? []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label="Fees due (total)" value={feeSummary ? `₹${feeSummary.total.toLocaleString()}` : "—"} tone="warning" />
        <StatCard icon={Wallet} label="Collected" value={feeSummary ? `₹${feeSummary.paid.toLocaleString()}` : "—"} tone="success" />
        <StatCard icon={Wallet} label="Pending" value={feeSummary ? `₹${feeSummary.pending.toLocaleString()}` : "—"} tone="destructive" />
      </div>

      <Card className="mt-6 border-border/70 bg-gradient-card shadow-elegant">
        <CardHeader>
          <CardTitle className="font-display">Fee collection status</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeSummary ? [
              { name: "Total", value: feeSummary.total },
              { name: "Collected", value: feeSummary.paid },
              { name: "Pending", value: feeSummary.pending },
            ] : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
