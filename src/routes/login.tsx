import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { confirmPasswordReset, requestPasswordReset } from "@/lib/account.functions";
import { parseAccountId } from "@/lib/account-id";
import { authClient, signIn } from "@/lib/auth/client";
import { AccountSlot } from "@/components/account-slot";
import { useFactories } from "@/lib/factories";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "تسجيل — صنع في مصر" }] }),
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const sections = useFactories((state) => state.sections);
  const addFactory = useFactories((state) => state.addFactory);
  const [mode, setMode] = useState<"register" | "signin" | "reset">("register");
  const [accountKind, setAccountKind] = useState<"buyer" | "factory">("buyer");
  const [name, setName] = useState("");
  const [factoryName, setFactoryName] = useState("");
  const [sectionId, setSectionId] = useState("clothes");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [factoryPhone, setFactoryPhone] = useState("");
  const [dailyCapacity, setDailyCapacity] = useState("");
  const [machineCount, setMachineCount] = useState("");
  const [notes, setNotes] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [issuedCode, setIssuedCode] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseAccountId(identifier);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (!(mode === "reset" && !issuedCode) && password.length < 8) {
      setError("كلمة السر 8 حروف على الأقل.");
      return;
    }
    if (mode === "register" && name.trim().length < 2) {
      setError("اكتب الاسم.");
      return;
    }
    if (mode === "register" && accountKind === "factory" && factoryName.trim().length < 2) {
      setError("اكتب اسم المصنع.");
      return;
    }
    const capacity = Number(dailyCapacity);
    const machines = Number(machineCount);
    if (mode === "register" && accountKind === "factory") {
      if (area.trim().length < 2) {
        setError("اكتب المنطقة.");
        return;
      }
      if (address.trim().length < 5) {
        setError("اكتب عنوان الورشة.");
        return;
      }
      if (factoryPhone.trim().length < 8) {
        setError("اكتب تليفون الورشة.");
        return;
      }
      if (!Number.isFinite(capacity) || capacity <= 0) {
        setError("اكتب القدرة اليومية بعدد القطع.");
        return;
      }
      if (!Number.isFinite(machines) || machines <= 0) {
        setError("اكتب عدد الماكينات.");
        return;
      }
      if (notes.trim().length < 10) {
        setError("اكتب وصف مختصر للشغل، عشر حروف على الأقل.");
        return;
      }
    }
    setPending(true);
    setError("");
    setNotice("");
    if (mode === "reset") {
      if (!issuedCode) {
        const sent = await requestPasswordReset({ data: { email: parsed.email } });
        setPending(false);
        if (!sent.found) {
          setError("مفيش حساب بالإيميل أو الرقم ده.");
          return;
        }
        setIssuedCode(sent.code);
        setNotice("البريد مش متوصل، فكود الاستعادة ظاهر تحت. صالح 15 دقيقة.");
        return;
      }
      const reset = await confirmPasswordReset({
        data: { email: parsed.email, code: resetCode.trim(), password },
      });
      setPending(false);
      if (!reset.ok) {
        setError(reset.reason);
        return;
      }
      setMode("signin");
      setIssuedCode("");
      setResetCode("");
      setPassword("");
      setNotice("تم تغيير كلمة السر. ادخل بيها دلوقتي.");
      return;
    }
    if (mode === "register") sessionStorage.setItem("san3-kind", accountKind);
    const result =
      mode === "register"
        ? await authClient.signUp.email({
            email: parsed.email,
            password,
            name: name.trim(),
          })
        : await authClient.signIn.email({
            email: parsed.email,
            password,
          });
    setPending(false);
    if (result.error) {
      const message = result.error.message ?? "";
      setError(
        /exist/i.test(message)
          ? "الحساب موجود. ادخل من تبويب دخول."
          : /invalid|credential|password/i.test(message)
            ? "الإيميل أو الموبايل أو كلمة السر غير صحيحة."
            : "ما قدرناش نكمل التسجيل. راجع البيانات وحاول تاني.",
      );
      return;
    }
    if (mode === "register" && accountKind === "factory" && result.data?.user.id) {
      addFactory({
        name: factoryName.trim(),
        sectionId,
        area: area.trim(),
        address: address.trim(),
        phone: factoryPhone.trim(),
        dailyCapacity: capacity,
        machines: [{ type: "خط إنتاج", count: machines }],
        notes: notes.trim(),
        ownerUserId: result.data.user.id,
      });
    }
    void navigate({ to: mode === "register" && accountKind === "factory" ? "/profile" : "/" });
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-extrabold">حسابك</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          ادخل بحساب جوجل، أو بالإيميل أو رقم الموبايل وكلمة سر. الرقم وسيلة دخول من غير رسالة تأكيد.
        </p>
        {isPending ? <p className="mt-6 text-sm text-muted">بنراجع الجلسة...</p> : null}
        {user && !user.isDevFallback ? (
          <div className="mt-6 rounded-card border border-line bg-surface p-4">
            <p className="text-sm">أنت داخل دلوقتي.</p>
            <div className="mt-3">
              <AccountSlot />
            </div>
          </div>
        ) : null}
        {!isPending && (!user || user.isDevFallback) ? (
          <form onSubmit={submit} className="mt-6 grid gap-3 rounded-card border border-line bg-surface p-4">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setError("");
                setPending(true);
                void signIn("grok-google", { callbackURL: "/" }).catch(() => {
                  setPending(false);
                  setError("ما اتفتحش حساب جوجل. اسمح بالنوافذ المنبثقة وحاول تاني.");
                });
              }}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-line bg-bg font-bold disabled:opacity-60"
            >
              <GoogleMark />
              الدخول بحساب جوجل
            </button>
            <p className="text-center text-xs font-bold text-muted">أو</p>
            {mode !== "reset" ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("register")}
                className={
                  "h-11 rounded-xl text-sm font-bold " +
                  (mode === "register" ? "bg-primary text-primary-fg" : "border border-line")
                }
              >
                حساب جديد
              </button>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={
                  "h-11 rounded-xl text-sm font-bold " +
                  (mode === "signin" ? "bg-primary text-primary-fg" : "border border-line")
                }
              >
                دخول
              </button>
            </div>
            ) : (
              <p className="text-sm font-bold">استعادة كلمة السر</p>
            )}
            {mode === "register" ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountKind("buyer")}
                  className={
                    "h-11 rounded-xl text-sm font-bold " +
                    (accountKind === "buyer" ? "bg-accent text-accent-fg" : "border border-line")
                  }
                >
                  عميل
                </button>
                <button
                  type="button"
                  onClick={() => setAccountKind("factory")}
                  className={
                    "h-11 rounded-xl text-sm font-bold " +
                    (accountKind === "factory" ? "bg-accent text-accent-fg" : "border border-line")
                  }
                >
                  صاحب مصنع
                </button>
              </div>
            ) : null}
            {mode === "register" ? (
              <label>
                <span className="mb-1 block text-sm font-bold">الاسم</span>
                <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
              </label>
            ) : null}
            {mode === "register" && accountKind === "factory" ? (
              <>
                <label>
                  <span className="mb-1 block text-sm font-bold">اسم المصنع</span>
                  <input className="field" value={factoryName} onChange={(event) => setFactoryName(event.target.value)} />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">قسم التصنيع</span>
                  <select className="field" value={sectionId} onChange={(event) => setSectionId(event.target.value)}>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">المنطقة</span>
                  <input className="field" value={area} onChange={(event) => setArea(event.target.value)} placeholder="شبرا الخيمة" required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">عنوان الورشة</span>
                  <input className="field" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="الشارع والعلامة" required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">تليفون الورشة</span>
                  <input className="field" value={factoryPhone} onChange={(event) => setFactoryPhone(event.target.value)} placeholder="01xxxxxxxxx" inputMode="tel" required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">القدرة اليومية (قطعة)</span>
                  <input className="field" type="number" min={1} value={dailyCapacity} onChange={(event) => setDailyCapacity(event.target.value)} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">عدد الماكينات</span>
                  <input className="field" type="number" min={1} value={machineCount} onChange={(event) => setMachineCount(event.target.value)} required />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">وصف الشغل</span>
                  <textarea className="field" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="بتصنعوا إيه، ومن إمتى" required />
                </label>
              </>
            ) : null}
            <label>
              <span className="mb-1 block text-sm font-bold">الإيميل أو الموبايل</span>
              <input
                className="field"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="name@email.com أو 010xxxxxxxx"
                autoComplete="username"
                inputMode="text"
              />
            </label>
            {mode !== "reset" || issuedCode ? (
            <label>
              <span className="mb-1 block text-sm font-bold">{mode === "reset" ? "كلمة السر الجديدة" : "كلمة السر"}</span>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "register" || mode === "reset" ? "new-password" : "current-password"}
              />
            </label>
            ) : null}
            {mode === "reset" && issuedCode ? (
              <>
                <p className="rounded-xl bg-bg px-3 py-2 text-sm font-bold">كود الاستعادة: {issuedCode}</p>
                <label>
                  <span className="mb-1 block text-sm font-bold">اكتب الكود</span>
                  <input className="field" value={resetCode} onChange={(event) => setResetCode(event.target.value)} inputMode="numeric" />
                </label>
              </>
            ) : null}
            {notice ? <p className="text-sm font-semibold text-ok">{notice}</p> : null}
            {error ? <p className="text-sm font-semibold text-bad">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="h-12 rounded-xl bg-accent font-bold text-accent-fg disabled:opacity-60"
            >
              {pending
                ? "لحظة..."
                : mode === "reset"
                  ? issuedCode
                    ? "حفظ كلمة السر الجديدة"
                    : "اطلب كود الاستعادة"
                  : mode === "register"
                    ? "إنشاء الحساب"
                    : "دخول"}
            </button>
            {mode === "signin" ? (
              <button
                type="button"
                className="text-sm font-bold text-primary"
                onClick={() => {
                  setMode("reset");
                  setIssuedCode("");
                  setError("");
                  setNotice("");
                }}
              >
                نسيت كلمة السر؟
              </button>
            ) : null}
            {mode === "reset" ? (
              <button type="button" className="text-sm font-bold" onClick={() => setMode("signin")}>
                رجوع للدخول
              </button>
            ) : null}
          </form>
        ) : null}
      </div>
    </SiteShell>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.9 10.7A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.2.3-1.7V5H.9a9 9 0 0 0 0 8l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.3A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
    </svg>
  );
}
