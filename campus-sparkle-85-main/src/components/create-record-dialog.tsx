import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "date";
  required?: boolean;
  placeholder?: string;
};

/**
 * Generic "create record" dialog for admin CRUD screens.
 * Keeps things compact — full edit pages live per resource where needed.
 */
export function CreateRecordDialog({
  table, title, description, fields, invalidateKey, trigger, transform,
}: {
  table: string; title: string; description?: string;
  fields: FieldDef[];
  invalidateKey: unknown[];
  trigger?: ReactNode;
  transform?: (v: Record<string, any>) => Record<string, any>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = transform ? transform(values) : values;
    const { error } = await supabase.from(table as never).insert(payload as never);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(`${title} created`);
    setOpen(false);
    setValues({});
    qc.invalidateQueries({ queryKey: invalidateKey });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button><Plus className="mr-2 h-4 w-4" />New</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
              <Input
                id={f.name}
                type={f.type ?? "text"}
                required={f.required}
                placeholder={f.placeholder}
                value={values[f.name] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
