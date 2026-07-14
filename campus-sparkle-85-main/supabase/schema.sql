-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('super_admin','principal','hod','faculty','student','parent','accountant','librarian','warden','placement_officer');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','excused');
CREATE TYPE public.fee_status AS ENUM ('pending','paid','partial','overdue','waived');

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_any_role(_roles public.app_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ANY(_roles));
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'principal'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- ============ AUTO-CREATE PROFILE + FIRST USER = SUPER_ADMIN ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'super_admin');
  ELSE
    -- default new signups to 'student'; admins can change later
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ DEPARTMENTS / COURSES / SUBJECTS ============
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  hod_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read depts" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write depts" ON public.departments FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal']::public.app_role[]));
CREATE TRIGGER trg_dept_updated BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  duration_years INT NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/HOD write courses" ON public.courses FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]));
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  credits INT NOT NULL DEFAULT 3,
  semester INT NOT NULL DEFAULT 1,
  faculty_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/HOD write subjects" ON public.subjects FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]));
CREATE TRIGGER trg_subjects_updated BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STUDENTS ============
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  roll_number TEXT NOT NULL UNIQUE,
  admission_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  semester INT NOT NULL DEFAULT 1,
  section TEXT DEFAULT 'A',
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  admission_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read students" ON public.students FOR SELECT TO authenticated USING (
  public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty','accountant','librarian','warden','placement_officer']::public.app_role[])
  OR user_id = auth.uid()
);
CREATE POLICY "Admins write students" ON public.students FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]));
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FACULTY ============
CREATE TABLE public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  designation TEXT,
  qualification TEXT,
  experience_years INT DEFAULT 0,
  joining_date DATE DEFAULT CURRENT_DATE,
  salary NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faculty TO authenticated;
GRANT ALL ON public.faculty TO service_role;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read faculty" ON public.faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write faculty" ON public.faculty FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod']::public.app_role[]));
CREATE TRIGGER trg_faculty_updated BEFORE UPDATE ON public.faculty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read attendance" ON public.attendance FOR SELECT TO authenticated USING (
  public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[])
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = attendance.student_id AND s.user_id = auth.uid())
);
CREATE POLICY "Faculty write attendance" ON public.attendance FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]));

-- ============ EXAMS + MARKS ============
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'internal',
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_date DATE,
  max_marks NUMERIC(6,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read exams" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff write exams" ON public.exams FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]));

CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(6,2) NOT NULL DEFAULT 0,
  grade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(exam_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marks TO authenticated;
GRANT ALL ON public.marks TO service_role;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read marks" ON public.marks FOR SELECT TO authenticated USING (
  public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[])
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = marks.student_id AND s.user_id = auth.uid())
);
CREATE POLICY "Staff write marks" ON public.marks FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]));

-- ============ ASSIGNMENTS ============
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  due_date DATE,
  max_marks NUMERIC(6,2) DEFAULT 100,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff write assignments" ON public.assignments FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]));

CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  file_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  marks_obtained NUMERIC(6,2),
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_submissions TO authenticated;
GRANT ALL ON public.assignment_submissions TO service_role;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING (
  public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[])
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = assignment_submissions.student_id AND s.user_id = auth.uid())
);
CREATE POLICY "Student submit own" ON public.assignment_submissions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));
CREATE POLICY "Student update own submission" ON public.assignment_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));
CREATE POLICY "Staff grade submissions" ON public.assignment_submissions FOR UPDATE TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty']::public.app_role[]));

-- ============ FEES ============
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  semester INT,
  amount NUMERIC(12,2) NOT NULL,
  academic_year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_structures TO authenticated;
GRANT ALL ON public.fee_structures TO service_role;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read fee structures" ON public.fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance write fee structures" ON public.fee_structures FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','accountant']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','accountant']::public.app_role[]));

CREATE TABLE public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.fee_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  receipt_number TEXT,
  paid_on TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_payments TO authenticated;
GRANT ALL ON public.fee_payments TO service_role;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own fees or staff" ON public.fee_payments FOR SELECT TO authenticated USING (
  public.current_user_has_any_role(ARRAY['super_admin','principal','accountant','hod']::public.app_role[])
  OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = fee_payments.student_id AND s.user_id = auth.uid())
);
CREATE POLICY "Finance write fees" ON public.fee_payments FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','accountant']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','accountant']::public.app_role[]));
CREATE TRIGGER trg_fee_payments_updated BEFORE UPDATE ON public.fee_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NOTICES ============
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  audience TEXT NOT NULL DEFAULT 'all',
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read notices" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff post notices" ON public.notices FOR ALL TO authenticated
  USING (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty','placement_officer']::public.app_role[]))
  WITH CHECK (public.current_user_has_any_role(ARRAY['super_admin','principal','hod','faculty','placement_officer']::public.app_role[]));

-- ============ SECURITY REVOKES ============
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_has_any_role(public.app_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
