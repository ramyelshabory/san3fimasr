import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { usePlatform } from "@/lib/platform";

export const Route = createFileRoute("/consult")({
  component: ConsultPage,
  head: () => ({
    meta: [
      { title: "استشارات — صنع في مصر" },
      {
        name: "description",
        content: "عندك رأس مال ومش عايز تبني مصنع؟ فريق الاستشارات يقولك تختار إيه، تستهدف مين، تسوّق إزاي، وتحسب الربح.",
      },
    ],
  }),
});

const steps = [
  ["تختار المنتج", "الفريق يرشّح قطعة عليها طلب، مش أي فكرة شكلها حلو."],
  ["تستهدف مين", "محل جملة، أونلاين، أو يونيفورم شركات. كل واحد له كمية وسعر."],
  ["تسوّق إزاي", "عينة، قائمة محلات، وحملة في المنطقة قبل ما تخزّن."],
  ["تحسب الربح", "تكلفة المصنع + التشغيل + التسويق، والباقي هامشك. التصنيع عند الغير."],
];

function ConsultPage() {
  const addConsultation = usePlatform((state) => state.addConsultation);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    capital: "",
    idea: "",
    target: "",
  });

  return (
    <SiteShell>
      <header className="mb-6 max-w-2xl">
        <p className="text-sm font-bold text-accent">لأصحاب رؤوس الأموال</p>
        <h1 className="mt-1 text-3xl font-extrabold">اصنع عند الغير، من غير ما تبني مصنع.</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          الاستشارة بتبدأ من الفكرة لحد أول طلبية. مش بنبيع لك ماكينة. بنوصلك بمصنع معتمد ونساعدك
          تبيع.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {steps.map(([title, text]) => (
          <article key={title} className="rounded-card border border-line bg-surface p-4">
            <h2 className="font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </article>
        ))}
      </div>
      <form
        className="mt-8 grid gap-3 rounded-card border border-line bg-surface p-4 md:grid-cols-2 md:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.name.trim() || !form.phone.trim() || !form.idea.trim()) return;
          addConsultation(form);
          setSent(true);
        }}
      >
        <h2 className="text-lg font-bold md:col-span-2">اطلب توجيه</h2>
        <label>
          <span className="mb-1 block text-sm font-bold">الاسم</span>
          <input
            className="field"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-bold">التليفون</span>
          <input
            className="field"
            inputMode="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-bold">رأس المال التقريبي</span>
          <input
            className="field"
            value={form.capital}
            onChange={(event) => setForm({ ...form, capital: event.target.value })}
            placeholder="مثال: 400 ألف جنيه"
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-bold">تستهدف مين؟</span>
          <input
            className="field"
            value={form.target}
            onChange={(event) => setForm({ ...form, target: event.target.value })}
          />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-bold">الفكرة</span>
          <textarea
            className="field"
            rows={3}
            value={form.idea}
            onChange={(event) => setForm({ ...form, idea: event.target.value })}
            required
          />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="h-12 rounded-xl bg-primary px-5 font-bold text-primary-fg">
            إرسال
          </button>
          {sent ? (
            <p className="mt-3 text-sm font-semibold text-ok">
              وصل طلبك. فريق الاستشارات هيراجعه من لوحة التحكم.
            </p>
          ) : null}
        </div>
      </form>
    </SiteShell>
  );
}
