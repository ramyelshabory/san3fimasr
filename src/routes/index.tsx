import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { shareFactory, WhatsAppButton } from "@/components/whatsapp-share";
import { lowestPrice, machineTotal, money, useFactories } from "@/lib/factories";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "صنع في مصر" }] }),
});

const shots = [
  { src: "/media/workshop-1.jpg", title: "ورشة بيجام" },
  { src: "/media/machines.jpg", title: "خط المكن" },
  { src: "/media/tee.jpg", title: "تيشيرت سادة" },
];

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <SiteShell>
      <section className="grid items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-bold text-accent">شبرا الخيمة · باسوس · بهتيم</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">
            مصانع مصر، مصنّفة حسب قسم التصنيع.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            ملابس، أثاث، أغذية، بلاستيك، معادن وتغليف. شوف القدرة اليومية والسعر، أو ابعث عرضك للمصنع.
          </p>
          <form
            className="mt-6 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void navigate({ to: "/directory", search: { q: query.trim(), section: "" } });
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بمنطقة أو منتج أو اسم مصنع"
              className="field sm:flex-1"
              aria-label="بحث في المصانع"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-primary px-5 font-bold text-primary-fg"
            >
              دور على مصنع
            </button>
          </form>
        </div>
        <div className="relative">
          <img
            src="/media/workshop-1.jpg"
            alt="ورشة ملابس في شبرا الخيمة"
            className="h-72 w-full rounded-card object-cover md:h-96"
          />
          <p className="absolute bottom-4 right-4 rounded-xl bg-surface px-3 py-2 text-sm font-bold">
            كود الجودة SM-2026-014
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-3 md:grid-cols-3">
        {[
          ["1", "الزيارة والكود", "فريق الأرض يسجّل الورشة، والجودة تصدر كود تصنيع قبل الظهور."],
          ["2", "السعر أو العرض", "جدول أسعار حسب الكمية، أو ابعث عرضك لو عايز سعر مختلف."],
          ["3", "التصنيع عند الغير", "صاحب رأس المال يختار المنتج، وإحنا نوصله بالمصنع والتسويق."],
        ].map(([step, title, text]) => (
          <article key={step} className="rounded-card border border-line bg-surface p-5">
            <p className="text-sm font-extrabold text-accent">خطوة {step}</p>
            <h2 className="mt-1 text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl font-extrabold">المصانع حسب القسم</h2>
          <Link to="/directory" search={{ q: "", section: "" }} className="text-sm font-bold text-primary">
            كل المصانع
          </Link>
        </div>
        <SectionPicker />
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">من الورشة</h2>
          <Link to="/gallery" className="text-sm font-bold text-primary">
            المعرض
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {shots.map((shot) => (
            <figure key={shot.src} className="overflow-hidden rounded-card">
              <img src={shot.src} alt={shot.title} className="h-28 w-full object-cover md:h-44" />
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 rounded-card bg-sidebar p-6 text-sidebar-fg md:grid-cols-[1.4fr_auto] md:items-center">
        <div>
          <h2 className="text-2xl font-extrabold">عندك رأس مال ومش عايز تبني مصنع؟</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-sidebar-muted">
            فريق الاستشارات يقولك تختار إيه، تستهدف مين، تسوّق إزاي، وتحسب الربح. التصنيع يتم عند
            مصنع موجود على المنصة.
          </p>
        </div>
        <Link
          to="/consult"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-5 font-bold text-accent-fg"
        >
          اطلب استشارة
        </Link>
      </section>
    </SiteShell>
  );
}

function SectionPicker() {
  const factories = useFactories((state) => state.factories);
  const sections = useFactories((state) => state.sections);
  const approved = factories.filter((factory) => factory.status === "approved");
  const initial =
    sections.find((section) => approved.some((factory) => factory.sectionId === section.id))?.id ??
    sections[0]?.id ??
    "clothes";
  const [sectionId, setSectionId] = useState(initial);
  const active = sections.find((section) => section.id === sectionId) ?? sections[0];
  const list = active ? approved.filter((factory) => factory.sectionId === active.id) : [];

  return (
    <div className="mt-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((section) => {
          const count = approved.filter((factory) => factory.sectionId === section.id).length;
          const on = section.id === active?.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setSectionId(section.id)}
              className={
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold " +
                (on ? "bg-primary text-primary-fg" : "border border-line bg-surface")
              }
            >
              {section.name}
              <span className={"rounded-full px-2 py-0.5 text-xs " + (on ? "bg-white/20" : "bg-bg text-muted")}>
                {count.toLocaleString("ar-EG")}
              </span>
            </button>
          );
        })}
      </div>
      {active ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted">{active.blurb}</p>
          <Link
            to="/directory"
            search={{ q: "", section: active.id }}
            className="text-sm font-bold text-primary"
          >
            كل مصانع {active.name}
          </Link>
        </div>
      ) : null}
      {list.length === 0 ? (
        <div className="mt-4 rounded-card border border-dashed border-line bg-surface p-8 text-center">
          <p className="text-sm text-muted">لسه مفيش مصنع معتمد في القسم ده.</p>
          <Link to="/login" className="mt-3 inline-block text-sm font-bold text-primary">
            سجّل مصنعك
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((factory) => {
            const from = lowestPrice(factory);
            return (
              <article key={factory.id} className="relative overflow-hidden rounded-card border border-line bg-surface">
                <Link to="/directory/$factoryId" params={{ factoryId: factory.id }} className="block">
                  <img src={factory.cover} alt="" className="h-44 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{factory.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {factory.area} · {factory.qualityCode}
                    </p>
                    <p className="mt-3 text-sm">
                      {machineTotal(factory)} ماكينة · {factory.dailyCapacity.toLocaleString("ar-EG")} قطعة/يوم
                      {from ? ` · من ${money(from)}` : ""}
                    </p>
                  </div>
                </Link>
                <div className="absolute top-3 left-3">
                  <WhatsAppButton compact label={`شارك ${factory.name}`} onClick={() => shareFactory(factory)} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
