-- Migration: initial schema for recipe service MVP
-- Generated from requirements document

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  display_name text
);

drop index if exists idx_recipes_user;
drop index if exists idx_recipes_type;
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  servings int check (servings > 0),
  dish_type text not null check (dish_type in ('main','side')),
  time_minutes int check (time_minutes >= 0),
  cost_rank text check (cost_rank in ('S','A','B','C')),
  instructions text,
  source_url text
);
create index if not exists idx_recipes_user on public.recipes(user_id);
create index if not exists idx_recipes_type on public.recipes(dish_type);

drop index if exists idx_ing_recipe;
create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  amount numeric,
  unit text,
  note text
);
create index if not exists idx_ing_recipe on public.recipe_ingredients(recipe_id);

drop index if exists idx_menus_user;
drop index if exists idx_menus_period;
create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  menu_type text not null check (menu_type in ('today','week')),
  start_date date not null,
  end_date date not null
);
create index if not exists idx_menus_user on public.menus(user_id);
create index if not exists idx_menus_period on public.menus(start_date, end_date);

drop index if exists idx_menu_items_menu;
drop index if exists idx_menu_items_date;
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  target_date date not null,
  slot text not null check (slot in ('main','side')),
  recipe_id uuid not null references public.recipes(id)
);
create index if not exists idx_menu_items_menu on public.menu_items(menu_id);
create index if not exists idx_menu_items_date on public.menu_items(target_date);

drop index if exists idx_shopping_items_list;
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  title text,
  source_menu_id uuid references public.menus(id) on delete set null
);

drop index if exists idx_shopping_items_list;
create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  name text not null,
  amount numeric,
  unit text,
  checked boolean default false
);
create index if not exists idx_shopping_items_list on public.shopping_list_items(shopping_list_id);

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.menus enable row level security;
alter table public.menu_items enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;

drop policy if exists "own_recipes" on public.recipes;
create policy "own_recipes" on public.recipes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_recipe_ingredients" on public.recipe_ingredients;
create policy "own_recipe_ingredients" on public.recipe_ingredients
  for all
  using (
    exists(select 1 from public.recipes r where r.id = recipe_id and r.user_id = auth.uid())
  )
  with check (
    exists(select 1 from public.recipes r where r.id = recipe_id and r.user_id = auth.uid())
  );

drop policy if exists "own_menus" on public.menus;
create policy "own_menus" on public.menus
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_menu_items" on public.menu_items;
create policy "own_menu_items" on public.menu_items
  for all
  using (
    exists(select 1 from public.menus m where m.id = menu_id and m.user_id = auth.uid())
  )
  with check (
    exists(select 1 from public.menus m where m.id = menu_id and m.user_id = auth.uid())
  );

drop policy if exists "own_shopping_lists" on public.shopping_lists;
create policy "own_shopping_lists" on public.shopping_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_shopping_list_items" on public.shopping_list_items;
create policy "own_shopping_list_items" on public.shopping_list_items
  for all
  using (
    exists(select 1 from public.shopping_lists s where s.id = shopping_list_id and s.user_id = auth.uid())
  )
  with check (
    exists(select 1 from public.shopping_lists s where s.id = shopping_list_id and s.user_id = auth.uid())
  );
