-- Step 1: Drop foreign key constraints that depend on the public.users table.
-- The task_assignees table has a foreign key to users.id.
alter table public.task_assignees drop constraint if exists task_assignees_user_id_fkey;
alter table public.comments drop constraint if exists comments_author_id_fkey;


-- Step 2: Drop the old public.users table.
drop table if exists public.users;


-- Step 3: Create the new public.profiles table, linked to auth.users.
create table public.profiles (
  id uuid not null primary key references auth.users on delete cascade,
  name text not null,
  avatar text
);

-- Step 4: Add comments to the new table for clarity.
comment on table public.profiles is 'User profile information, linked to authenticated users.';
comment on column public.profiles.id is 'Links to auth.users.id';


-- Step 5: Re-establish the foreign key constraints to point to the new profiles table.
alter table public.task_assignees 
  add constraint task_assignees_user_id_fkey 
  foreign key (user_id) 
  references public.profiles(id) on delete cascade;

alter table public.comments
  add constraint comments_author_id_fkey
  foreign key (author_id)
  references public.profiles(id) on delete cascade;


-- Step 6: Create a function to handle new user sign-ups.
-- This function will be triggered when a new user is created in the auth.users table.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert a new row into the public.profiles table.
  -- The 'id' is taken from the new user record.
  -- The 'name' is extracted from the raw_user_meta_data JSONB field (we'll set this during sign-up).
  insert into public.profiles (id, name, avatar)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar');
  return new;
end;
$$;

-- Step 7: Create a trigger to execute the function after a new user is inserted.
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Step 8: Enable Row Level Security (RLS) for the profiles table.
alter table public.profiles enable row level security;

-- Step 9: Create security policies for the profiles table.
-- Policy 1: Allow users to view all profiles. This is a common choice for collaborative apps.
create policy "Allow all users to view profiles"
  on public.profiles for select
  using ( auth.role() = 'authenticated' );

-- Policy 2: Allow users to update their own profile.
create policy "Allow user to update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );
