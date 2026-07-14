import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

export type AppRole =
  | "super_admin" | "principal" | "hod" | "faculty" | "student"
  | "parent" | "accountant" | "librarian" | "warden" | "placement_officer";

export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, loading };
}

export function useMyRoles() {
  const { user } = useSessionUser();
  return useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<AppRole[]> => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
}

export function useMyProfile() {
  const { user } = useSessionUser();
  return useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function hasAnyRole(roles: AppRole[] | undefined, wanted: AppRole[]): boolean {
  if (!roles) return false;
  return roles.some((r) => wanted.includes(r));
}

export const STAFF_ROLES: AppRole[] = ["super_admin", "principal", "hod"];
export const TEACHING_ROLES: AppRole[] = ["super_admin", "principal", "hod", "faculty"];
