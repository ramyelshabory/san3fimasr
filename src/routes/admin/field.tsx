import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { usePlatform } from "@/lib/platform";

export const Route = createFileRoute("/admin/field")({ component: FieldPage });

const results = ["تم التعريف", "سجّل", "يحتاج زيارة ثانية", "رفض"];

function FieldPage() {
  const visits = usePlatform((state) => state.visits);
  const addVisit = usePlatform((state) => state.addVisit);
  const [form, setForm] = useState({
    factoryName: "",
    agent: "",
    area: "شبرا الخيمة",
    result: results[0],
    note: "",
  });

  return (
    <DashboardShell>
      <Gate moduleId="field">
        <h1 className="mb-2 text-3xl font-extrabold">فريق التسويق الميداني</h1>
        <p className="mb-6 text-sm text-muted">
          نزول على الورش اللي مالهاش وجود على السوشيال، جمع البيانات، والتعريف بالمنصة.
        </p>
        <form
          className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.factoryName.trim() || !form.agent.trim()) return;
            addVisit(form);
            setForm({ ...form, factoryName: "", note: "" });
          }}
        >
          <input className="field" placeholder="اسم الورشة" value={form.factoryName} onChange={(e) => setForm({ ...form, factoryName: e.target.value })} aria-label="اسم الورشة" />
          <input className="field" placeholder="المندوب" value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} aria-label="المندوب" />
          <input className="field" placeholder="المنطقة" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} aria-label="المنطقة" />
          <select className="field" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} aria-label="النتيجة">
            {results.map((result) => (
              <option key={result}>{result}</option>
            ))}
          </select>
          <textarea className="field md:col-span-2" rows={2} placeholder="ماذا وجد الفريق؟" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} aria-label="ملاحظة" />
          <button className="h-11 rounded-xl bg-primary font-bold text-primary-fg md:col-span-2">تسجيل الزيارة</button>
        </form>
        <div className="grid gap-3">
          {visits.map((visit) => (
            <article key={visit.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold">{visit.factoryName}</h2>
                <span className="rounded-full bg-ok-bg px-3 py-1 text-sm font-bold text-ok">{visit.result}</span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {visit.agent} · {visit.area}
              </p>
              {visit.note ? <p className="mt-2 text-sm">{visit.note}</p> : null}
            </article>
          ))}
        </div>
      </Gate>
    </DashboardShell>
  );
}
