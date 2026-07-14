import { createFileRoute, Outlet, redirect, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, GraduationCap, Building2, BookOpen, ClipboardCheck,
  FileText, ScrollText, Wallet, Megaphone, UserCircle, LogOut, Moon, Sun, Bell, Library, GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { useMyProfile, useMyRoles } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV_MAIN = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Faculty", url: "/faculty", icon: GraduationCap },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Courses", url: "/courses", icon: GitBranch },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
];
const NAV_ACADEMICS = [
  { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
  { title: "Assignments", url: "/assignments", icon: FileText },
  { title: "Exams", url: "/exams", icon: ScrollText },
  { title: "Results", url: "/results", icon: Library },
];
const NAV_ADMIN = [
  { title: "Fees", url: "/fees", icon: Wallet },
  { title: "Notices", url: "/notices", icon: Megaphone },
];

function AuthedLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (u: string) => pathname === u || pathname.startsWith(u + "/");

  const Section = ({ label, items }: { label: string; items: typeof NAV_MAIN }) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => (
            <SidebarMenuItem key={it.url}>
              <SidebarMenuButton asChild isActive={isActive(it.url)} tooltip={it.title}>
                <Link to={it.url}>
                  <it.icon />
                  <span>{it.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display text-base font-bold">CampusERP</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <Section label="Manage" items={NAV_MAIN} />
        <Section label="Academics" items={NAV_ACADEMICS} />
        <Section label="Administration" items={NAV_ADMIN} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/profile")} tooltip="Profile">
              <Link to="/profile"><UserCircle /><span>Profile</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: profile } = useMyProfile();
  const { data: roles } = useMyRoles();
  const initials = (profile?.full_name || profile?.email || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-3 backdrop-blur-md md:px-6">
      <SidebarTrigger />
      <div className="flex-1" />
      {roles && roles[0] && (
        <Badge variant="secondary" className="hidden capitalize md:inline-flex">
          {roles[0].replace(/_/g, " ")}
        </Badge>
      )}
      <Button variant="ghost" size="icon" aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-2">
            <Avatar className="h-7 w-7"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <span className="hidden text-sm md:inline">{profile?.full_name || profile?.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{profile?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/profile"><UserCircle className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
