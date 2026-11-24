const PHONE_DOMAIN = "phone.san3fimasr.app";

export type AccountId =
  | { ok: true; email: string; kind: "email" | "phone"; label: string }
  | { ok: false; error: string };

export function parseAccountId(raw: string): AccountId {
  const value = raw.trim();
  if (!value) return { ok: false, error: "اكتب الإيميل أو رقم الموبايل." };
  if (value.includes("@")) {
    const email = value.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "الإيميل غير مكتمل." };
    }
    return { ok: true, email, kind: "email", label: email };
  }
  let digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("20") && digits.length === 12) digits = `0${digits.slice(2)}`;
  if (!/^01[0125]\d{8}$/.test(digits)) {
    return { ok: false, error: "اكتب إيميل صحيح، أو موبايل مصري من 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015." };
  }
  return { ok: true, email: `${digits}@${PHONE_DOMAIN}`, kind: "phone", label: digits };
}

export function isPhoneEmail(email: string | null | undefined) {
  return Boolean(email?.endsWith(`@${PHONE_DOMAIN}`));
}

export function accountLabel(email: string | null | undefined, name: string | null | undefined) {
  if (isPhoneEmail(email) && email) return email.slice(0, email.indexOf("@"));
  return name || email || "حسابي";
}
