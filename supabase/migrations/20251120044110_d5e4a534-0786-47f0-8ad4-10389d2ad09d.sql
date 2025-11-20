-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('teacher', 'student');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only system can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (false);

-- Add GitHub fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS github_username text,
ADD COLUMN IF NOT EXISTS github_avatar_url text,
ADD COLUMN IF NOT EXISTS github_repos_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_github_sync timestamp with time zone;

-- Create assignment_submissions table
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  repository_id uuid REFERENCES public.repositories(id) ON DELETE SET NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  grade numeric,
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for assignment_submissions
CREATE POLICY "Students can view their own submissions"
ON public.assignment_submissions FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Students can create their own submissions"
ON public.assignment_submissions FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions in their batches"
ON public.assignment_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.batches b ON b.id = a.batch_id
    WHERE a.id = assignment_submissions.assignment_id
    AND b.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update submissions in their batches"
ON public.assignment_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.batches b ON b.id = a.batch_id
    WHERE a.id = assignment_submissions.assignment_id
    AND b.teacher_id = auth.uid()
  )
);

-- Create update triggers
CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modify handle_new_user function to assign roles based on auth method
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Determine role based on provider
  IF NEW.raw_app_meta_data->>'provider' = 'github' THEN
    user_role := 'student';
  ELSE
    user_role := 'teacher';
  END IF;

  -- Insert into users table
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;