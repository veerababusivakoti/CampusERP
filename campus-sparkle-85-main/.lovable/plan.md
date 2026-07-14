
# CampusERP — Build Plan

The full PRD spans 15+ modules, 10 roles, payments, SMS, real-time, mobile apps and AI proctoring — that's several months of engineering. I'll ship a **production-quality foundation** covering the highest-value modules end-to-end, then we iterate. Everything below is real DB + real auth + real UI, not mocks.

## Tech mapping (PRD → Lovable)
- PRD says: React/Vite/TS + Tailwind + shadcn + Node/Express + Prisma + Postgres + JWT.
- Lovable stack: **TanStack Start** (React 19 + Vite + TS) + Tailwind + shadcn + **Lovable Cloud** (Postgres + Auth + Storage + Server Functions). Same capabilities, zero setup. RBAC via `user_roles` table + RLS.

## Design
- Modern Emerald: `#064E3B / #10B981 / #F9FAFB / #0F172A` in oklch tokens, dark mode, Space Grotesk display + Inter body, elegant shadows, gradient hero, subtle motion. All semantic tokens in `src/styles.css`.

## Phase 1 — Foundation (this build)

**Auth & RBAC**
- Email/password + Google sign-in via Lovable Cloud
- Roles: `super_admin`, `principal`, `hod`, `faculty`, `student`, `parent`, `accountant`, `librarian`, `warden`, `placement_officer`
- `user_roles` table + `has_role()` security-definer function + RLS
- Managed `_authenticated` layout, `/auth` public page, role-based redirects

**Database (Cloud / Postgres)**
- `profiles` (linked to `auth.users`)
- `user_roles`
- `departments`, `courses`, `subjects`
- `students` (roll no, admission, department, semester, section)
- `faculty` (employee id, department, designation)
- `attendance` (student, subject, date, status)
- `exams`, `marks`
- `assignments`, `assignment_submissions`
- `fee_structures`, `fee_payments`
- `notices`
- `audit_logs`
- All with RLS scoped by role + ownership. Grants for authenticated/service_role.

**UI — role-aware app shell**
- Sidebar + top bar with search, notifications, profile menu, theme toggle
- Dashboard widgets: cards + Recharts (line, bar, pie, area)
- Skeletons, toasts, tables with pagination/filter/sort, modals, forms (react-hook-form + zod)

**Modules wired end-to-end**
1. **Dashboard** (per role) — real counts, charts
2. **Student management** — list, detail, create, edit, promote, filters by dept/sem
3. **Faculty management** — list, detail, create, edit
4. **Departments & Courses & Subjects** — CRUD
5. **Attendance** — faculty marks by class+date; student sees % + subject-wise chart
6. **Assignments** — faculty upload (Cloud Storage), student submit, marks
7. **Exams & Results** — marks entry, CGPA calc, student result view
8. **Fees** — fee structures, record payment, receipts, student payment history
9. **Notices** — post + list
10. **Profile & Settings** — avatar upload, password change

**Routes (TanStack file-based)**
```
/                     landing + login CTA
/auth                 sign in / sign up
/_authenticated/
  dashboard
  students, students/$id, students/new
  faculty, faculty/$id, faculty/new
  departments, courses, subjects
  attendance
  assignments, assignments/$id
  exams, results
  fees, fees/pay
  notices
  profile, settings
  admin/*             (super_admin + principal only)
```

## Phase 1 explicit non-goals (Phase 2+ candidates)
Library, Hostel, Transport, Placement, Leave workflow UI, Alumni, Events, Complaints, Parent portal, Timetable builder, ID card generator, TC generator, real Razorpay/Stripe checkout, SMS/email delivery, Google Meet/Zoom, push notifications, face-recognition/QR attendance, LMS, mobile apps, AI proctoring. These are wired conceptually (tables/pages stubbed where cheap) but not fully built until you confirm priorities.

## What you'll see after this build
- Working login, sign-up with role selection (admin approves in a real deployment; for now first user becomes super_admin)
- Seeded demo data (2 departments, 4 subjects, 5 students, 2 faculty, sample attendance/marks/fees) so dashboards look alive
- Real CRUD + charts + RLS across the modules listed above
- Emerald design system, dark mode, responsive

## After you approve
I'll execute in this order, ~1 large batch each:
1. Enable Lovable Cloud + migrations (schema, roles, RLS, seed)
2. Design system + app shell + auth pages
3. Dashboards + student/faculty/dept/course CRUD
4. Attendance + assignments + exams/results
5. Fees + notices + profile/settings + polish

Reply **"go"** to start, or tell me to drop/add modules from Phase 1.
