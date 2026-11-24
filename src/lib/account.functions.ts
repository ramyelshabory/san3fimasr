import { createHash, randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { isPhoneEmail } from "@/lib/account-id";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const kindSchema = z.object({
  kind: z.enum(["auto", "factory", "buyer"]).optional(),
});

function codeHash(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export const claimAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: unknown) => kindSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const users = await sql<{ email: string }>`select email from "user" where id = ${context.userId}`;
    const email = users[0]?.email ?? "";
    const isEmail = Boolean(email) && !isPhoneEmail(email);
    const kind = data.kind === "factory" ? "factory" : "buyer";
    const emailKind = isEmail ? "email" : "phone";
    const rows = await sql<{ role: string }>`
      insert into app_role (user_id, role)
      select ${context.userId},
        case
          when ${emailKind} = 'email' and not exists (select 1 from app_role where role = 'admin') then 'admin'
          when ${kind} = 'factory' then 'factory'
          else 'buyer'
        end
      where not exists (select 1 from app_role where user_id = ${context.userId})
      returning role
    `;
    if (rows[0]) return { role: rows[0].role };
    const existing = await sql<{ role: string }>`select role from app_role where user_id = ${context.userId}`;
    return { role: existing[0]?.role ?? "buyer" };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ role: string }>`select role from app_role where user_id = ${context.userId}`;
    return { role: rows[0]?.role ?? null };
  });

const resetRequest = z.object({ email: z.string().min(3) });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resetRequest.parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const email = data.email.trim().toLowerCase();
    const users = await sql<{ id: string }>`select id from "user" where lower(email) = ${email}`;
    if (!users.length) return { found: false as const };
    const code = String(100000 + (randomBytes(3).readUIntBE(0, 3) % 900000));
    const id = randomBytes(12).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await sql`
      insert into password_reset (id, email, code_hash, expires_at)
      values (${id}, ${email}, ${codeHash(code)}, ${expires})
    `;
    return { found: true as const, code };
  });

const resetConfirm = z.object({
  email: z.string().min(3),
  code: z.string().min(4),
  password: z.string().min(8),
});

export const confirmPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resetConfirm.parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const email = data.email.trim().toLowerCase();
    const rows = await sql<{ id: string }>`
      select id from password_reset
      where email = ${email}
        and code_hash = ${codeHash(data.code.trim())}
        and used = false
        and expires_at > now()
      limit 1
    `;
    if (!rows[0]) return { ok: false as const, reason: "الكود غير صحيح أو انتهت صلاحيته." };
    const password = await hashPassword(data.password);
    const updated = await sql<{ id: string }>`
      update "account"
      set password = ${password}, "updatedAt" = now()
      where "userId" in (select id from "user" where lower(email) = ${email})
        and "providerId" = 'credential'
      returning id
    `;
    await sql`update password_reset set used = true where id = ${rows[0].id}`;
    if (!updated.length) {
      return { ok: false as const, reason: "الحساب ده داخل بجوجل، ومفيهوش كلمة سر نغيرها." };
    }
    return { ok: true as const };
  });
