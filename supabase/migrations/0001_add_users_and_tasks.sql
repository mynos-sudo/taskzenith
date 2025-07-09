-- Create a table for users
create table if not exists users (
  id text not null primary key,
  name text not null,
  email text not null unique,
  avatar text
);

-- Custom types for task properties
create type public.task_status as enum ('todo', 'in-progress', 'done', 'backlog');
create type public.task_priority as enum ('low', 'medium', 'high', 'critical');

-- Create a table for tasks
create table if not exists tasks (
  id text not null primary key,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date timestamptz,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a join table for task assignees (many-to-many relationship)
create table if not exists task_assignees (
  task_id text not null references public.tasks(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  primary key (task_id, user_id)
);

-- Create a table for comments
create table if not exists comments (
  id text not null primary key,
  content text not null,
  task_id text not null references public.tasks(id) on delete cascade,
  author_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
-- We will define policies later, but it's good practice to enable it now.
alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.comments enable row level security;

-- For now, allow public read access and authenticated users to do everything.
-- THIS IS INSECURE FOR PRODUCTION. We will replace these with specific policies.
create policy "Allow all access to authenticated users on users"
  on public.users for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow read access to everyone on users"
  on public.users for select
  using (true);

create policy "Allow all access to authenticated users on tasks"
  on public.tasks for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow all access to authenticated users on task_assignees"
  on public.task_assignees for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow all access to authenticated users on comments"
  on public.comments for all
  to authenticated
  using (true)
  with check (true);

-- Insert mock users from data.ts to get started
-- In a real app, this would be handled by your auth system.
insert into public.users (id, name, email, avatar)
values
  ('user-1', 'Ada Lovelace', 'ada@example.com', 'https://i.pravatar.cc/150?u=ada'),
  ('user-2', 'Grace Hopper', 'grace@example.com', 'https://i.pravatar.cc/150?u=grace'),
  ('user-3', 'Charles Babbage', 'charles@example.com', 'https://i.pravatar.cc/150?u=charles'),
  ('user-4', 'Alan Turing', 'alan@example.com', 'https://i.pravatar.cc/150?u=alan')
on conflict (email) do nothing;
