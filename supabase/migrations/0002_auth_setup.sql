-- Step 1: Drop existing foreign key constraints that reference the old 'users' table.
-- We will re-create these later with the correct UUID type.
alter table task_assignees drop constraint if exists task_assignees_user_id_fkey;
alter table comments drop constraint if exists comments_author_id_fkey;


-- Step 2: Since we are moving to a real auth system, the mock user data and relations are no longer valid.
-- We will clear any existing data that references old user IDs.
delete from task_assignees;
update comments set author_id = null;


-- Step 3: Drop the old 'users' table.
drop table if exists users;


-- Step 4: Create the new 'profiles' table, which will be linked to Supabase's built-in auth.users table.
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  avatar text
);
-- Add comments for clarity
comment on table profiles is 'Profile data for each user.';
comment on column profiles.id is 'References the user in auth.users.';


-- Step 5: Enable Row Level Security (RLS) for the profiles table.
-- This is a crucial security measure.
alter table profiles enable row level security;
-- Create policies to control access.
-- 1. Users can see all profiles (you can lock this down further if needed).
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
-- 2. Users can only insert or update their own profile.
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);


-- Step 6: Create a trigger to automatically create a profile for new user sign-ups.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar');
  return new;
end;
$$;
-- Link the trigger to the auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Step 7: Alter the columns in related tables to use the UUID type, matching the new 'profiles' table.
alter table task_assignees alter column user_id type uuid using null; -- We cleared the data, so using NULL is fine.
alter table comments alter column author_id type uuid using null;


-- Step 8: Re-establish the foreign key constraints with the new 'profiles' table.
alter table task_assignees add constraint task_assignees_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table comments add constraint comments_author_id_fkey foreign key (author_id) references profiles(id) on delete set null;
