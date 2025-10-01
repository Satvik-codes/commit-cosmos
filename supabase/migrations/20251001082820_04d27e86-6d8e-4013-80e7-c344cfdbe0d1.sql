-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE assignment_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE activity_type AS ENUM ('commit', 'pull_request', 'issue', 'create', 'push');

-- Users table (extends auth.users with additional profile data)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  github_username TEXT UNIQUE,
  github_access_token TEXT,
  github_refresh_token TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Batches table (class groups)
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Batch students (many-to-many relationship)
CREATE TABLE public.batch_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(batch_id, student_id)
);

-- Topics table (curriculum mapping)
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB NOT NULL DEFAULT '[]',
  rubric JSONB,
  topics UUID[] NOT NULL DEFAULT '{}',
  due_date TIMESTAMPTZ,
  status assignment_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Repositories table
CREATE TABLE public.repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  github_repo_id BIGINT,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  last_synced_at TIMESTAMPTZ,
  webhook_id BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analyses table (AI grading results)
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID NOT NULL REFERENCES public.repositories(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  commit_sha TEXT NOT NULL,
  status analysis_status NOT NULL DEFAULT 'pending',
  overall_grade NUMERIC(5,2),
  requirements_met JSONB NOT NULL DEFAULT '[]',
  topic_coverage JSONB NOT NULL DEFAULT '{}',
  feedback TEXT,
  suggestions JSONB NOT NULL DEFAULT '[]',
  code_quality_score NUMERIC(5,2),
  error_message TEXT,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities table (GitHub events and attendance)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES public.repositories(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  github_event_id TEXT,
  commit_sha TEXT,
  commit_message TEXT,
  additions INTEGER,
  deletions INTEGER,
  files_changed INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for batches table
CREATE POLICY "Teachers can manage their own batches"
  ON public.batches FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view batches they belong to"
  ON public.batches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.batch_students
      WHERE batch_id = batches.id AND student_id = auth.uid()
    )
  );

-- RLS Policies for batch_students table
CREATE POLICY "Teachers can manage students in their batches"
  ON public.batch_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.batches
      WHERE id = batch_students.batch_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their batch enrollments"
  ON public.batch_students FOR SELECT
  USING (student_id = auth.uid());

-- RLS Policies for topics table (public read)
CREATE POLICY "Anyone can view topics"
  ON public.topics FOR SELECT
  USING (true);

-- RLS Policies for assignments table
CREATE POLICY "Teachers can manage assignments in their batches"
  ON public.assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.batches
      WHERE id = assignments.batch_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view assignments in their batches"
  ON public.assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.batch_students bs
      JOIN public.assignments a ON a.batch_id = bs.batch_id
      WHERE bs.student_id = auth.uid() AND a.id = assignments.id
    )
  );

-- RLS Policies for repositories table
CREATE POLICY "Students can manage their own repositories"
  ON public.repositories FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view repositories of their students"
  ON public.repositories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.batch_students bs
      JOIN public.batches b ON b.id = bs.batch_id
      WHERE bs.student_id = repositories.student_id AND b.teacher_id = auth.uid()
    )
  );

-- RLS Policies for analyses table
CREATE POLICY "Students can view analyses of their repositories"
  ON public.analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.repositories
      WHERE id = analyses.repository_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view analyses of their students"
  ON public.analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.repositories r
      JOIN public.batch_students bs ON bs.student_id = r.student_id
      JOIN public.batches b ON b.id = bs.batch_id
      WHERE r.id = analyses.repository_id AND b.teacher_id = auth.uid()
    )
  );

-- RLS Policies for activities table
CREATE POLICY "Students can view their own activities"
  ON public.activities FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view activities of their students"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.batch_students bs
      JOIN public.batches b ON b.id = bs.batch_id
      WHERE bs.student_id = activities.student_id AND b.teacher_id = auth.uid()
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_users_github_username ON public.users(github_username);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_batches_teacher_id ON public.batches(teacher_id);
CREATE INDEX idx_batch_students_batch_id ON public.batch_students(batch_id);
CREATE INDEX idx_batch_students_student_id ON public.batch_students(student_id);
CREATE INDEX idx_assignments_batch_id ON public.assignments(batch_id);
CREATE INDEX idx_repositories_student_id ON public.repositories(student_id);
CREATE INDEX idx_repositories_assignment_id ON public.repositories(assignment_id);
CREATE INDEX idx_analyses_repository_id ON public.analyses(repository_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_activities_student_id ON public.activities(student_id);
CREATE INDEX idx_activities_occurred_at ON public.activities(occurred_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON public.repositories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default topics for curriculum mapping
INSERT INTO public.topics (name, description, category, keywords) VALUES
  ('Object-Oriented Programming', 'Classes, inheritance, polymorphism, encapsulation', 'Programming Fundamentals', ARRAY['class', 'extends', 'implements', 'interface', 'abstract', 'inheritance', 'polymorphism']),
  ('REST APIs', 'RESTful API design and implementation', 'Backend Development', ARRAY['express', 'router', 'get', 'post', 'put', 'delete', 'api', 'endpoint', 'rest']),
  ('Testing', 'Unit testing, integration testing, test coverage', 'Quality Assurance', ARRAY['test', 'jest', 'mocha', 'chai', 'describe', 'it', 'expect', 'assert']),
  ('Database Operations', 'SQL queries, ORM usage, database design', 'Data Management', ARRAY['database', 'sql', 'query', 'select', 'insert', 'update', 'delete', 'orm', 'prisma', 'sequelize']),
  ('Authentication & Security', 'User authentication, authorization, security best practices', 'Security', ARRAY['auth', 'jwt', 'token', 'password', 'hash', 'bcrypt', 'session', 'oauth']),
  ('Microservices', 'Microservices architecture and patterns', 'Architecture', ARRAY['microservice', 'service', 'docker', 'container', 'kubernetes']),
  ('Frontend Development', 'React, component design, state management', 'Frontend', ARRAY['react', 'component', 'state', 'props', 'hooks', 'jsx']),
  ('Version Control', 'Git workflow, branching, pull requests', 'Development Process', ARRAY['git', 'commit', 'branch', 'merge', 'pull request', 'pr'])
ON CONFLICT (name) DO NOTHING;