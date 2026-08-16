-- ==========================================================================
-- SHO. Portfolio — Supabase schema
-- Supabaseの SQL Editor に、この内容をそのまま貼り付けて実行してください。
-- ==========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. qualifications（資格）
-- ---------------------------------------------------------------------
create table if not exists qualifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table qualifications enable row level security;

create policy "Public can read qualifications"
  on qualifications for select
  using (true);

create policy "Authenticated can insert qualifications"
  on qualifications for insert
  to authenticated
  with check (true);

create policy "Authenticated can update qualifications"
  on qualifications for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete qualifications"
  on qualifications for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 2. projects（プロジェクト）
-- ---------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  tech text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Public can read projects"
  on projects for select
  using (true);

create policy "Authenticated can insert projects"
  on projects for insert
  to authenticated
  with check (true);

create policy "Authenticated can update projects"
  on projects for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete projects"
  on projects for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 3. skills（スキル）
-- ---------------------------------------------------------------------
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table skills enable row level security;

create policy "Public can read skills"
  on skills for select
  using (true);

create policy "Authenticated can insert skills"
  on skills for insert
  to authenticated
  with check (true);

create policy "Authenticated can update skills"
  on skills for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete skills"
  on skills for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 4. （任意）最初のサンプルデータ
-- ---------------------------------------------------------------------

-- insert into qualifications (name, status, sort_order) values
--   ('ITパスポート', 'Challenge', 1),
--   ('生成AIパスポート', 'Challenge', 2);

-- insert into projects (name, description, tech, url, sort_order) values
--   ('Price App', '暗号資産の価格を表示するWebアプリ。', 'HTML, CSS, JavaScript', 'https://sk00015116.github.io/price-app/', 1);

-- insert into skills (name, sort_order) values
--   ('HTML', 1), ('CSS', 2), ('JavaScript', 3), ('Python', 4), ('Flask', 5), ('GitHub', 6);

-- ==========================================================================
-- セキュリティについての補足
--
-- 上のポリシーは「ログインしているユーザーなら誰でも書き込める」設定です。
-- これは、Supabase Authで新規サインアップを無効化し、あなた専用の管理者
-- アカウントだけを手動で作成する前提で安全になります（README.md参照）。
--
-- もし「特定の1つのメールアドレスだけ」に書き込みを絞りたい場合は、
-- 各ポリシーの using(true) / with check(true) の部分を、以下のように
-- 書き換えてください（xxxx@example.com は自分の管理者メールアドレスに変更）。
--
--   using ( (select auth.jwt() ->> 'email') = 'xxxx@example.com' )
-- ==========================================================================
