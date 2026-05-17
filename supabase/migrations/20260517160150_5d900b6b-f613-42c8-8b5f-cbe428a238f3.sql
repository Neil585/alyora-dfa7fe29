-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  birth_year int,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- assessments (dossier d'evaluation)
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  taken_at timestamptz not null default now(),
  phq9_score int not null default 0,
  gad7_score int not null default 0,
  burnout_score int not null default 0,
  stress_score int not null default 0,
  sleep_score int not null default 0,
  answers jsonb not null default '{}'::jsonb,
  categories text[] not null default '{}',
  summary text,
  created_at timestamptz not null default now()
);
alter table public.assessments enable row level security;
create policy "assessments_owner_all" on public.assessments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index assessments_user_taken_idx on public.assessments(user_id, taken_at desc);

-- daily check ins
create table public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  mood int not null check (mood between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  unique(user_id, day)
);
alter table public.daily_check_ins enable row level security;
create policy "checkins_owner_all" on public.daily_check_ins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- practitioners (annuaire public)
create table public.practitioners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null,
  specialties text[] not null default '{}',
  city text not null,
  country text not null default 'France',
  languages text[] not null default '{français}',
  modalities text[] not null default '{cabinet,visio}',
  price_eur int not null default 60,
  years_experience int not null default 5,
  bio text not null,
  photo_url text,
  approach text,
  created_at timestamptz not null default now()
);
alter table public.practitioners enable row level security;
create policy "practitioners_public_read" on public.practitioners for select using (true);

-- chat threads & messages
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nouvelle conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chat_threads enable row level security;
create policy "threads_owner_all" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index threads_user_updated_idx on public.chat_threads(user_id, updated_at desc);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  parts jsonb,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "messages_owner_all" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index messages_thread_created_idx on public.chat_messages(thread_id, created_at asc);

-- auto profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();