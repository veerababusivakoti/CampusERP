import { createFileRoute } from "@tanstack/react-router";
import { useMyProfile, useMyRoles, useSessionUser } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSessionUser();
  const { data: profile } = useMyProfile();
  const { data: roles } = useMyRoles();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["my-profile"] });
  };

  const initials = (profile?.full_name || profile?.email || "U").split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" description="Your account information." />
      <Card className="border-border/70 shadow-elegant">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar>
            <div>
              <CardTitle className="font-display">{profile?.full_name ?? profile?.email}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(roles ?? []).map((r) => (
                  <Badge key={r} variant="secondary" className="capitalize">{r.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
