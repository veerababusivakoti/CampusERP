export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_url: string | null
          id: string
          marks_obtained: number | null
          student_id: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          marks_obtained?: number | null
          student_id: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          marks_obtained?: number | null
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          file_url: string | null
          id: string
          max_marks: number | null
          subject_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          max_marks?: number | null
          subject_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          max_marks?: number | null
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_by: string | null
          remarks: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department_id: string
          duration_years: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id: string
          duration_years?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string
          duration_years?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          hod_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          hod_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          hod_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          exam_date: string | null
          exam_type: string
          id: string
          max_marks: number
          name: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          exam_type?: string
          id?: string
          max_marks?: number
          name: string
          subject_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_type?: string
          id?: string
          max_marks?: number
          name?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          created_at: string
          department_id: string | null
          designation: string | null
          email: string | null
          employee_id: string
          experience_years: number | null
          full_name: string
          id: string
          joining_date: string | null
          phone: string | null
          qualification: string | null
          salary: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          designation?: string | null
          email?: string | null
          employee_id: string
          experience_years?: number | null
          full_name: string
          id?: string
          joining_date?: string | null
          phone?: string | null
          qualification?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          designation?: string | null
          email?: string | null
          employee_id?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          joining_date?: string | null
          phone?: string | null
          qualification?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          fee_structure_id: string | null
          id: string
          paid_amount: number
          paid_on: string | null
          payment_method: string | null
          receipt_number: string | null
          status: Database["public"]["Enums"]["fee_status"]
          student_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          fee_structure_id?: string | null
          id?: string
          paid_amount?: number
          paid_on?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: Database["public"]["Enums"]["fee_status"]
          student_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          fee_structure_id?: string | null
          id?: string
          paid_amount?: number
          paid_on?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          status?: Database["public"]["Enums"]["fee_status"]
          student_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string | null
          amount: number
          course_id: string | null
          created_at: string
          id: string
          name: string
          semester: number | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          course_id?: string | null
          created_at?: string
          id?: string
          name: string
          semester?: number | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          course_id?: string | null
          created_at?: string
          id?: string
          name?: string
          semester?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          created_at: string
          exam_id: string
          grade: string | null
          id: string
          marks_obtained: number
          student_id: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          student_id: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          audience: string
          body: string
          category: string
          created_at: string
          id: string
          posted_by: string | null
          title: string
        }
        Insert: {
          audience?: string
          body: string
          category?: string
          created_at?: string
          id?: string
          posted_by?: string | null
          title: string
        }
        Update: {
          audience?: string
          body?: string
          category?: string
          created_at?: string
          id?: string
          posted_by?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_date: string | null
          admission_number: string | null
          course_id: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          email: string | null
          full_name: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          phone: string | null
          roll_number: string
          section: string | null
          semester: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          admission_number?: string | null
          course_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          phone?: string | null
          roll_number: string
          section?: string | null
          semester?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          admission_number?: string | null
          course_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          phone?: string | null
          roll_number?: string
          section?: string | null
          semester?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          course_id: string
          created_at: string
          credits: number
          faculty_id: string | null
          id: string
          name: string
          semester: number
          updated_at: string
        }
        Insert: {
          code: string
          course_id: string
          created_at?: string
          credits?: number
          faculty_id?: string | null
          id?: string
          name: string
          semester?: number
          updated_at?: string
        }
        Update: {
          code?: string
          course_id?: string
          created_at?: string
          credits?: number
          faculty_id?: string | null
          id?: string
          name?: string
          semester?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_has_any_role: {
        Args: { _roles: Database["public"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "principal"
        | "hod"
        | "faculty"
        | "student"
        | "parent"
        | "accountant"
        | "librarian"
        | "warden"
        | "placement_officer"
      attendance_status: "present" | "absent" | "late" | "excused"
      fee_status: "pending" | "paid" | "partial" | "overdue" | "waived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "principal",
        "hod",
        "faculty",
        "student",
        "parent",
        "accountant",
        "librarian",
        "warden",
        "placement_officer",
      ],
      attendance_status: ["present", "absent", "late", "excused"],
      fee_status: ["pending", "paid", "partial", "overdue", "waived"],
    },
  },
} as const
