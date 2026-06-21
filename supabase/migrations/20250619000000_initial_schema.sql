-- DayFlow initial schema

create type public.task_status as enum ('todo', 'in_progress', 'done');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  position integer not null default 0,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_blocks_ends_after_starts check (ends_at > starts_at)
);

create index tasks_user_id_position_idx on public.tasks (user_id, position);
create index time_blocks_user_id_starts_at_idx on public.time_blocks (user_id, starts_at);

alter table public.tasks enable row level security;
alter table public.time_blocks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

create policy "Users can view their own time blocks"
  on public.time_blocks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own time blocks"
  on public.time_blocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own time blocks"
  on public.time_blocks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own time blocks"
  on public.time_blocks for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger time_blocks_set_updated_at
  before update on public.time_blocks
  for each row execute function public.set_updated_at();
