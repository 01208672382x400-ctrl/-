-- Voice rooms production schema for Supabase/PostgreSQL.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'مستخدم جديد',
  avatar_url text,
  country text default 'EG',
  coins bigint not null default 0 check (coins >= 0),
  diamonds bigint not null default 0 check (diamonds >= 0),
  vip_level int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  title text not null,
  host_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'voice' check (type in ('voice','party','video')),
  privacy text not null default 'public' check (privacy in ('public','private')),
  country text default 'EG',
  cover_url text,
  max_seats int not null default 8 check (max_seats between 2 and 16),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.room_seats (
  room_id uuid not null references public.rooms(id) on delete cascade,
  seat_no int not null check (seat_no between 1 and 16),
  user_id uuid references public.profiles(id) on delete set null,
  is_muted boolean not null default false,
  locked boolean not null default false,
  joined_at timestamptz,
  primary key (room_id, seat_no)
);

create unique index if not exists one_active_seat_per_user on public.room_seats(room_id, user_id) where user_id is not null;

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.recharge_packages (
  id uuid primary key default gen_random_uuid(),
  coins bigint not null,
  bonus bigint not null default 0,
  price_usd numeric(10,2) not null,
  popular boolean not null default false,
  enabled boolean not null default true
);

create index if not exists rooms_active_created_idx on public.rooms(is_active, created_at desc);
create index if not exists room_messages_room_created_idx on public.room_messages(room_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_seats enable row level security;
alter table public.room_messages enable row level security;
alter table public.app_settings enable row level security;
alter table public.recharge_packages enable row level security;

create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id);
create policy "rooms public read" on public.rooms for select using (is_active = true or auth.uid() = host_id);
create policy "rooms own insert" on public.rooms for insert with check (auth.uid() = host_id);
create policy "rooms own update" on public.rooms for update using (auth.uid() = host_id);
create policy "rooms own delete" on public.rooms for delete using (auth.uid() = host_id);
create policy "seats public read" on public.room_seats for select using (true);
create policy "seats own write" on public.room_seats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages public read" on public.room_messages for select using (true);
create policy "messages own insert" on public.room_messages for insert with check (auth.uid() = user_id);
create policy "messages own delete" on public.room_messages for delete using (auth.uid() = user_id);
create policy "recharge public read" on public.recharge_packages for select using (enabled = true);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name','مستخدم جديد')) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter publication supabase_realtime add table public.room_messages;
alter publication supabase_realtime add table public.room_seats;

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('recharge','gift_sent','gift_received','vip','admin_adjustment','refund')),
  coins_delta bigint not null default 0, diamonds_delta bigint not null default 0, reference_id uuid, note text,
  created_at timestamptz not null default now()
);
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(), name text not null, icon text not null default '🎁',
  price_coins bigint not null check (price_coins > 0), enabled boolean not null default true, sort_order int not null default 0
);
create table if not exists public.room_gifts (
  id uuid primary key default gen_random_uuid(), room_id uuid not null references public.rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade, receiver_id uuid not null references public.profiles(id) on delete cascade,
  gift_id uuid not null references public.gifts(id), quantity int not null default 1 check (quantity between 1 and 100), created_at timestamptz not null default now()
);
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade, following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (follower_id, following_id), check (follower_id <> following_id)
);
create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade, blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (blocker_id, blocked_id), check (blocker_id <> blocked_id)
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, title text not null, body text, data jsonb not null default '{}'::jsonb, read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.recharge_orders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid references public.recharge_packages(id) on delete set null, amount_usd numeric(10,2) not null,
  coins bigint not null, bonus bigint not null default 0, provider text not null default 'manual', provider_reference text,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')), created_at timestamptz not null default now(), paid_at timestamptz
);
create table if not exists public.vip_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  level int not null, status text not null default 'pending' check (status in ('pending','active','expired','cancelled')),
  starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists wallet_transactions_user_created_idx on public.wallet_transactions(user_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists room_gifts_room_created_idx on public.room_gifts(room_id, created_at desc);
create index if not exists follows_following_idx on public.follows(following_id);

alter table public.wallet_transactions enable row level security;
alter table public.gifts enable row level security;
alter table public.room_gifts enable row level security;
alter table public.follows enable row level security;
alter table public.blocks enable row level security;
alter table public.notifications enable row level security;
alter table public.recharge_orders enable row level security;
alter table public.vip_subscriptions enable row level security;

create policy "wallet own read" on public.wallet_transactions for select using (auth.uid() = user_id);
create policy "gifts public read" on public.gifts for select using (enabled = true);
create policy "room gifts public read" on public.room_gifts for select using (true);
create policy "follows public read" on public.follows for select using (true);
create policy "blocks own read" on public.blocks for select using (auth.uid() = blocker_id);
create policy "notifications own read" on public.notifications for select using (auth.uid() = user_id);
create policy "recharge own read" on public.recharge_orders for select using (auth.uid() = user_id);
create policy "vip own read" on public.vip_subscriptions for select using (auth.uid() = user_id);

create or replace function public.send_gift(p_sender uuid,p_receiver uuid,p_room uuid,p_gift uuid,p_quantity int)
returns jsonb language plpgsql security definer set search_path = public as $
declare g public.gifts; total bigint; sender_coins bigint; gift_event uuid;
begin
  if auth.uid() is null or p_sender <> auth.uid() then raise exception 'NOT_ALLOWED'; end if;
  if p_sender=p_receiver then raise exception 'CANNOT_GIFT_SELF'; end if;
  if p_quantity<1 or p_quantity>100 then raise exception 'INVALID_QUANTITY'; end if;
  if not exists(select 1 from public.rooms where id=p_room and is_active=true) then raise exception 'ROOM_NOT_FOUND'; end if;
  if not exists(select 1 from public.room_seats where room_id=p_room and user_id=p_receiver) then raise exception 'RECEIVER_NOT_IN_ROOM'; end if;
  select * into g from public.gifts where id=p_gift and enabled=true;
  if not found then raise exception 'GIFT_NOT_FOUND'; end if;
  total:=g.price_coins*p_quantity;
  select coins into sender_coins from public.profiles where id=p_sender for update;
  if sender_coins<total then raise exception 'INSUFFICIENT_COINS'; end if;
  update public.profiles set coins=coins-total,updated_at=now() where id=p_sender;
  update public.profiles set diamonds=diamonds+total,updated_at=now() where id=p_receiver;
  insert into public.room_gifts(room_id,sender_id,receiver_id,gift_id,quantity) values(p_room,p_sender,p_receiver,p_gift,p_quantity) returning id into gift_event;
  insert into public.wallet_transactions(user_id,kind,coins_delta,diamonds_delta,reference_id,note) values
   (p_sender,'gift_sent',-total,0,gift_event,g.name),(p_receiver,'gift_received',0,total,gift_event,g.name);
  insert into public.notifications(user_id,type,title,body,data) values(p_receiver,'gift','هدية جديدة','وصلتك هدية '||g.icon||' '||g.name,jsonb_build_object('room_id',p_room,'gift_id',p_gift,'quantity',p_quantity));
  return jsonb_build_object('ok',true,'event_id',gift_event,'cost',total);
end; $;

create or replace function public.admin_adjust_wallet(p_user uuid,p_coins bigint,p_diamonds bigint,p_note text)
returns jsonb language plpgsql security definer set search_path = public as $
begin
  if coalesce(auth.role(),'') <> 'service_role' then raise exception 'NOT_ALLOWED'; end if;
  update public.profiles set coins=greatest(0,coins+p_coins),diamonds=greatest(0,diamonds+p_diamonds),updated_at=now() where id=p_user;
  if not found then raise exception 'USER_NOT_FOUND'; end if;
  insert into public.wallet_transactions(user_id,kind,coins_delta,diamonds_delta,note) values(p_user,'admin_adjustment',p_coins,p_diamonds,p_note);
  return jsonb_build_object('ok',true);
end; $;

insert into public.gifts(name,icon,price_coins,sort_order) values
('وردة','🌹',10,1),('قلب','💖',50,2),('نجمة','⭐',100,3),('تاج','👑',500,4),('صاروخ','🚀',1000,5)
on conflict do nothing;


-- Application control layer: safe RPCs, public design settings, and missing RLS mutations.
alter table public.app_settings enable row level security;
drop policy if exists "app settings public read" on public.app_settings;
create policy "app settings public read" on public.app_settings for select using (true);

drop policy if exists "follows own insert" on public.follows;
drop policy if exists "follows own delete" on public.follows;
create policy "follows own insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows own delete" on public.follows for delete using (auth.uid() = follower_id);

drop policy if exists "blocks own insert" on public.blocks;
drop policy if exists "blocks own delete" on public.blocks;
create policy "blocks own insert" on public.blocks for insert with check (auth.uid() = blocker_id);
create policy "blocks own delete" on public.blocks for delete using (auth.uid() = blocker_id);

drop policy if exists "notifications own update" on public.notifications;
create policy "notifications own update" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recharge own insert" on public.recharge_orders;
create policy "recharge own insert" on public.recharge_orders for insert
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "vip own read" on public.vip_subscriptions;
create policy "vip own read" on public.vip_subscriptions for select using (auth.uid() = user_id);

-- Replace unsafe direct seat writes with controlled room RPCs.
drop policy if exists "seats own write" on public.room_seats;
drop policy if exists "seats public insert" on public.room_seats;
drop policy if exists "seats public update" on public.room_seats;
drop policy if exists "seats public delete" on public.room_seats;

create or replace function public.ensure_room_seats(p_room uuid)
returns void language plpgsql security definer set search_path=public as $$
declare r public.rooms; n int;
begin
  select * into r from public.rooms where id=p_room;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if auth.uid() <> r.host_id then raise exception 'NOT_ALLOWED'; end if;
  for n in 1..r.max_seats loop
    insert into public.room_seats(room_id,seat_no) values(p_room,n) on conflict do nothing;
  end loop;
end; $$;

create or replace function public.join_room_seat(p_room uuid,p_seat int)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.rooms; s public.room_seats; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into r from public.rooms where id=p_room and is_active=true;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if p_seat < 1 or p_seat > r.max_seats then raise exception 'INVALID_SEAT'; end if;
  perform public.ensure_room_seats(p_room);
  select * into s from public.room_seats where room_id=p_room and seat_no=p_seat for update;
  if s.locked and uid <> r.host_id then raise exception 'SEAT_LOCKED'; end if;
  if s.user_id is not null and s.user_id <> uid then raise exception 'SEAT_TAKEN'; end if;
  update public.room_seats set user_id=uid, joined_at=now() where room_id=p_room and seat_no=p_seat;
  return jsonb_build_object('ok',true,'seat',p_seat);
end; $$;

create or replace function public.leave_room_seat(p_room uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  update public.room_seats set user_id=null, joined_at=null, is_muted=false
  where room_id=p_room and user_id=auth.uid();
  return jsonb_build_object('ok',true);
end; $$;

create or replace function public.set_seat_state(p_room uuid,p_seat int,p_locked boolean,p_muted boolean)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.rooms;
begin
  select * into r from public.rooms where id=p_room;
  if not found or r.host_id <> auth.uid() then raise exception 'NOT_ALLOWED'; end if;
  update public.room_seats set locked=p_locked,is_muted=p_muted
  where room_id=p_room and seat_no=p_seat;
  return jsonb_build_object('ok',true);
end; $$;

create or replace function public.create_room(
  p_name text,p_title text,p_type text default 'voice',p_privacy text default 'public',
  p_country text default 'EG',p_cover_url text default null,p_max_seats int default 8
) returns public.rooms language plpgsql security definer set search_path=public as $$
declare r public.rooms;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  insert into public.rooms(name,title,host_id,type,privacy,country,cover_url,max_seats)
  values(p_name,p_title,auth.uid(),p_type,p_privacy,p_country,p_cover_url,p_max_seats)
  returning * into r;
  perform public.ensure_room_seats(r.id);
  return r;
end; $$;

-- Initial DB-driven design/feature configuration. Admins can replace these values.
insert into public.app_settings(key,value) values
('theme', '{"appName":"Voice Rooms","primary":"#7c3aed","accent":"#ec4899","background":"#07070a","card":"#111116","radius":"1.25rem"}'::jsonb),
('features', '{"rooms":true,"chat":true,"gifts":true,"wallet":true,"vip":true,"follow":true,"livekit":true}'::jsonb),
('home', '{"heroTitle":"الغرف الصوتية","heroSubtitle":"ادخل غرفة وتحدث مع الآخرين مباشرة","showCreateRoom":true}'::jsonb)
on conflict (key) do nothing;

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.app_settings;
