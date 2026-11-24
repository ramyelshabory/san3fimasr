create table if not exists app_role (
  user_id text primary key,
  role text not null,
  created_at timestamptz not null default now()
);

create table if not exists password_reset (
  id text primary key,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used boolean not null default false
);

create index if not exists password_reset_email_idx on password_reset (email);
