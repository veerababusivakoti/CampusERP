import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon, label, value, hint, tone = "primary",
}: {
  icon: LucideIcon; label: string; value: string | number; hint?: string;
  tone?: "primary" | "info" | "warning" | "success" | "destructive";
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Card className="border-border/70 bg-gradient-card shadow-elegant">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn("grid h-10 w-10 place-items-center rounded-xl", toneMap[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
