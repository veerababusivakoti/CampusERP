import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, Wallet, ClipboardCheck, BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Users, title: "Student & Faculty", desc: "Full lifecycle: admission, promotion, records." },
  { icon: ClipboardCheck, title: "Attendance", desc: "Bulk mark, analytics, subject-wise reports." },
  { icon: BookOpen, title: "Exams & Assignments", desc: "Marks entry, CGPA, submissions." },
  { icon: Wallet, title: "Fees & Receipts", desc: "Structures, payments, transaction history." },
  { icon: BarChart3, title: "Dashboards", desc: "Real-time insights for every role." },
  { icon: ShieldCheck, title: "Role-Based Access", desc: "10 roles, row-level security by design." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">CampusERP</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth">Get started</Link></Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Modern college management, reimagined</span>
          </div>
          <h1 className="text-balance font-display text-4xl font-bold leading-tight md:text-6xl">
            Run your entire college from{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">one platform</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
            Students, faculty, attendance, exams, fees, assignments, and reports — unified,
            secure, and beautifully designed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="shadow-elegant">
              <Link to="/auth">Launch your dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">Explore modules</a>
            </Button>
          </div>
        </motion.div>

        <section id="features" className="mt-24 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-border/70 bg-gradient-card p-6 shadow-elegant transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CampusERP. All rights reserved.
      </footer>
    </div>
  );
}
