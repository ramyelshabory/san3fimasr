import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { OperationsPanel } from "@/components/operations-panel";
import { SiteShell } from "@/components/site-shell";
import { accountLabel } from "@/lib/account-id";
import { authClient } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { sectionName, useFactories } from "@/lib/factories";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "حسابي — صنع في مصر" }] }),
});

function ProfilePage() {
  const { user, isPending } = useCurrentUserState();
  const factories = useFactories((state) => state.factories);
  const sections = useFactories((state) => state.sections);
  const updateFactory = useFactories((state) => state.updateFactory);
  const mine = factories.filter((factory) => factory.ownerUserId && factory.ownerUserId === user?.id);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (isPending) return <SiteShell><p className="text-sm text-muted">بنراجع الجلسة...</p></SiteShell>;
  if (!user || user.isDevFallback) return <RedirectToSignIn />;

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (next.length < 8) {
      setError("كلمة السر الجديدة 8 حروف على الأقل.");
      return;
    }
    setPending(true);
    setError("");
    setMessage("");
    const result = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (result.error) {
      setError("كلمة السر الحالية غير صحيحة، أو الحساب داخل بجوجل.");
      return;
    }
    setCurrent("");
    setNext("");
    setMessage("تم تغيير كلمة السر.");
  }

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-2xl gap-6">
        <header>
          <h1 className="text-3xl font-extrabold">حسابي</h1>
          <p className="mt-2 text-sm text-muted">{accountLabel(user.primaryEmail, user.displayName)}</p>
        </header>

        <form onSubmit={changePassword} className="grid gap-3 rounded-card border border-line bg-surface p-4">
          <h2 className="font-bold">تغيير كلمة السر</h2>
          <input className="field" type="password" value={current} onChange={(event) => setCurrent(event.target.value)} placeholder="كلمة السر الحالية" autoComplete="current-password" />
          <input className="field" type="password" value={next} onChange={(event) => setNext(event.target.value)} placeholder="كلمة السر الجديدة" autoComplete="new-password" />
          {error ? <p className="text-sm font-semibold text-bad">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-ok">{message}</p> : null}
          <button type="submit" disabled={pending} className="h-12 rounded-xl bg-primary font-bold text-primary-fg disabled:opacity-60">
            {pending ? "لحظة..." : "حفظ كلمة السر"}
          </button>
        </form>

        <section className="grid gap-3">
          <h2 className="text-xl font-extrabold">مصانعي</h2>
          {mine.length === 0 ? (
            <p className="text-sm text-muted">لو سجلت كصاحب مصنع، بياناته تظهر هنا بعد إنشاء الحساب.</p>
          ) : (
            mine.map((factory) => (
              <article key={factory.id} className="grid gap-3 rounded-card border border-line bg-surface p-4">
                <p className="text-sm font-bold text-accent">{sectionName(sections, factory.sectionId)} · {factory.status === "pending" ? "قيد المراجعة" : factory.status === "approved" ? "معتمد" : "غير ظاهر"}</p>
                <input className="field" value={factory.name} onChange={(event) => updateFactory(factory.id, { name: event.target.value })} aria-label="اسم المصنع" />
                <select className="field" value={factory.sectionId} onChange={(event) => updateFactory(factory.id, { sectionId: event.target.value })} aria-label="القسم">
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
                <input className="field" value={factory.area} onChange={(event) => updateFactory(factory.id, { area: event.target.value })} aria-label="المنطقة" />
                <input className="field" value={factory.address} onChange={(event) => updateFactory(factory.id, { address: event.target.value })} aria-label="العنوان" />
                <input className="field" value={factory.phone} onChange={(event) => updateFactory(factory.id, { phone: event.target.value })} aria-label="التليفون" />
                <input className="field" type="number" value={factory.dailyCapacity} onChange={(event) => updateFactory(factory.id, { dailyCapacity: Number(event.target.value) })} aria-label="القدرة اليومية" />
                <textarea className="field" rows={3} value={factory.notes} onChange={(event) => updateFactory(factory.id, { notes: event.target.value })} aria-label="ملاحظات" />
                <Link to="/directory/$factoryId" params={{ factoryId: factory.id }} className="text-sm font-bold text-primary">
                  صفحة المصنع للعملاء
                </Link>
                <h3 className="font-bold">بيانات التشغيل</h3>
                <OperationsPanel factoryId={factory.id} />
              </article>
            ))
          )}
        </section>
      </div>
    </SiteShell>
  );
}
