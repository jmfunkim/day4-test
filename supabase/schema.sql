-- Supabase > SQL Editor 에서 전체를 붙여넣고 Run

-- 1) 상품 테이블 (누구나 조회 가능, 수정은 대시보드에서만)
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  name        text    not null,
  description text,
  price       integer not null check (price >= 0),
  image_query text,                       -- Pixabay 검색어
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products are viewable by everyone"
  on public.products for select
  using (true);

-- 2) 장바구니 테이블 (본인 것만 접근)
create table if not exists public.cart_items (
  id          bigint generated always as identity primary key,
  user_id     uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  product_id  bigint not null references public.products(id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "cart: select own" on public.cart_items
  for select using (auth.uid() = user_id);
create policy "cart: insert own" on public.cart_items
  for insert with check (auth.uid() = user_id);
create policy "cart: update own" on public.cart_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart: delete own" on public.cart_items
  for delete using (auth.uid() = user_id);

-- 3) 샘플 상품
insert into public.products (name, description, price, image_query) values
  ('제주 감귤 3kg',     '새콤달콤 노지 감귤',           12000, 'jeju tangerine'),
  ('한라봉 2kg',        '향긋하고 달콤한 한라봉',       25000, 'hallabong'),
  ('흑돼지 오겹살 500g', '제주 흑돼지 구이용',           28000, 'black pork bbq'),
  ('돌하르방 기념품',    '제주의 수호신 미니 돌하르방',   9000, 'dol hareubang'),
  ('유채꽃 엽서 세트',   '유채꽃 풍경 엽서 10장',         6000, 'jeju canola flower'),
  ('제주 녹차 티백',     '오설록 스타일 제주 녹차',      15000, 'green tea field');
