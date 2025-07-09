-- supabase/migrations/0000_initial_schema.sql

-- For guidance on how to use this file with Supabase, see:
-- https://supabase.com/docs/guides/database/migrations

-- 1. Create a custom ENUM type for project statuses
CREATE TYPE public.project_status AS ENUM (
    'On Track',
    'At Risk',
    'Off Track',
    'Completed'
);

-- 2. Create the 'projects' table
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    color text,
    status public.project_status DEFAULT 'On Track'::public.project_status,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Allow public read access for now
CREATE POLICY "Allow public read-only access"
ON public.projects
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own projects
-- NOTE: This requires user authentication to be set up.
-- CREATE POLICY "Allow authenticated users to insert"
-- ON public.projects
-- FOR INSERT
-- WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own projects
-- NOTE: This assumes a 'user_id' column linked to auth.uid()
-- CREATE POLICY "Allow users to update their own projects"
-- ON public.projects
-- FOR UPDATE
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- 5. Add a trigger to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_projects_updated
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();