import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { shareFactory, WhatsAppButton } from "@/components/whatsapp-share";
import { lowestPrice, machineTotal, money, sectionName, useFactories } from "@/lib/factories";

type DirectorySearch = { q: string; section: string };

export const Route = createFileRoute("/directory/")({
  validateSearch: (search: Record<string, unknown>): DirectorySearch => ({
    q: typeof search.q === "string" ? search.q : "",
    section: typeof search.section === "string" ? search.section : "",
  }),
  component: DirectoryPage,
  head: () => ({
    meta: [
      { title: "المصانع — صنع في مصر" },
      {
        name: "description",
        content: "دور على مصنع في مصر حسب القسم والمنطقة — ملابس، أثاث، أغذية، بلاستيك، معادن وتغليف. شوف القدرة اليومية والسعر، أو ابعث عرضك للمصنع.",
      },
    ],
  }),
});

function DirectoryPage() {
  const { q, section } = Route.useSearch();
  const navigate = useNavigate();
  const factories = useFactories((state) => state.factories);
  const sections = useFactories((state) => state.sections);
  const [query, setQuery] = useState(q);
  const sectionId = section || "الكل";

  const results = useMemo(() => {
    const needle = query.trim();
    return factories.filter((factory) => {
      if (factory.status !== "approved") return false;
      if (sectionId !== "الكل" && factory.sectionId !== sectionId) return false;
      if (!needle) return true;
      return `${factory.name} ${factory.area} ${factory.specialties.join(" ")} ${factory.products
        .map((product) => product.name)
        .join(" ")}`.includes(needle);
    });
  }, [factories, query, sectionId]);

  function pickSection(id: string) {
    void navigate({
      to: "/directory",
      search: { q, section: id === "الكل" ? "" : id },
      replace: true,
    });
  }

  return (
    <SiteShell>
      <header className="mb-5">
        <h1 className="text-3xl font-extrabold">المصانع المعتمدة</h1>
        <p className="mt-2 text-sm text-muted">يظهر فقط من صدر له كود جودة بعد الزيارة.</p>
      </header>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="منطقة، منتج، أو اسم"
        className="field mb-4"
        aria-label="تصفية المصانع"
      />
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {[{ id: "الكل", name: "الكل" }, ...sections].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickSection(item.id)}
            className={
              "h-11 shrink-0 rounded-full px-4 text-sm font-bold " +
              (sectionId === item.id ? "bg-primary text-primary-fg" : "border border-line bg-surface")
            }
          >
            {item.name}
          </button>
        ))}
      </div>
      {results.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          لا يوجد مصنع معتمد مطابق.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((factory) => {
            const from = lowestPrice(factory);
            return (
              <article key={factory.id} className="relative overflow-hidden rounded-card border border-line bg-surface">
                <Link to="/directory/$factoryId" params={{ factoryId: factory.id }} className="block">
                  <img src={factory.cover} alt="" className="h-44 w-full object-cover" />
                  <div className="p-4">
                    <p className="text-xs font-bold text-accent">{sectionName(sections, factory.sectionId)}</p>
                    <h2 className="text-lg font-bold">{factory.name}</h2>
                    <p className="mt-1 text-sm text-muted">{factory.area}</p>
                    <p className="mt-3 text-sm">
                      {machineTotal(factory)} ماكينة · {factory.dailyCapacity.toLocaleString("ar-EG")}{" "}
                      قطعة/يوم
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
    </SiteShell>
  );
}
