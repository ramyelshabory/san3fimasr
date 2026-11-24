import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import {
  factoryMatches,
  lowestPrice,
  machineTotal,
  sectionName,
  useFactories,
  useFactorySearch,
} from "@/lib/factories";

export const Route = createFileRoute("/factories/")({ component: FactoriesPage });

function FactoriesPage() {
  const factories = useFactories((state) => state.factories);
  const sections = useFactories((state) => state.sections);
  const addSection = useFactories((state) => state.addSection);
  const addFactory = useFactories((state) => state.addFactory);
  const [sectionNameInput, setSectionNameInput] = useState("");
  const navigate = useNavigate();
  const query = useFactorySearch((state) => state.q);
  const setQuery = useFactorySearch((state) => state.setQ);

  const results = useMemo(
    () => factories.filter((factory) => factoryMatches(factory, query)),
    [factories, query],
  );

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">لوحة التحكم / المصانع</p>
          <h1 className="mt-1 text-3xl font-extrabold">المصانع</h1>
          <p className="mt-2 text-sm text-muted">البحث في الشريط أعلاه يشتغل من كل الصفحات.</p>
        </div>
        <button
          type="button"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-fg"
          onClick={() => {
            const id = addFactory();
            void navigate({ to: "/factories/$factoryId", params: { factoryId: id } });
          }}
        >
          <Plus className="size-4" />
          مصنع جديد
        </button>
      </header>

      <form
        className="mb-6 flex flex-col gap-2 rounded-card border border-line bg-surface p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!sectionNameInput.trim()) return;
          addSection(sectionNameInput);
          setSectionNameInput("");
        }}
      >
        <input
          className="field sm:flex-1"
          value={sectionNameInput}
          onChange={(event) => setSectionNameInput(event.target.value)}
          placeholder="قسم تصنيع جديد، مثل: أحذية"
          aria-label="اسم القسم"
        />
        <button type="submit" className="h-11 rounded-xl bg-accent px-4 font-bold text-accent-fg">
          إضافة قسم
        </button>
      </form>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {sections.map((section) => (
          <span key={section.id} className="shrink-0 rounded-full border border-line px-3 py-1 text-sm font-bold">
            {section.name}
          </span>
        ))}
      </div>

      <p className="mb-4 text-sm text-muted">
        {results.length.toLocaleString("ar-EG")} من {factories.length.toLocaleString("ar-EG")} مصنع
      </p>

      {results.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface p-10 text-center">
          <p className="font-bold">لا توجد مصانع مطابقة</p>
          <p className="mt-2 text-sm text-muted">جرّب اسم المنطقة أو التخصص أو امسح البحث.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 h-11 rounded-xl border border-line px-4 font-bold"
          >
            مسح البحث
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((factory) => {
            const from = lowestPrice(factory);
            return (
              <article
                key={factory.id}
                className="overflow-hidden rounded-card border border-line bg-surface"
              >
                <Link
                  to="/factories/$factoryId"
                  params={{ factoryId: factory.id }}
                  className="block transition hover:bg-bg"
                >
                  <img src={factory.cover} alt="" className="h-40 w-full object-cover" />
                  <div className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-accent">{sectionName(sections, factory.sectionId)}</p>
                    <h2 className="text-lg font-bold">{factory.name}</h2>
                      <StatusBadge status={factory.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">{factory.area}</p>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="rounded-xl bg-bg px-2 py-2">
                        <dt className="text-xs text-muted">الماكينات</dt>
                        <dd className="font-extrabold">{machineTotal(factory)}</dd>
                      </div>
                      <div className="rounded-xl bg-bg px-2 py-2">
                        <dt className="text-xs text-muted">قطعة/يوم</dt>
                        <dd className="font-extrabold">
                          {factory.dailyCapacity.toLocaleString("ar-EG")}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-bg px-2 py-2">
                        <dt className="text-xs text-muted">يبدأ من</dt>
                        <dd className="font-extrabold">{from ? `${from} ج` : "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <Link
                    to="/factories/$factoryId"
                    params={{ factoryId: factory.id }}
                    hash="edit"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line font-bold text-primary"
                  >
                    <Pencil className="size-4" />
                    تعديل البيانات
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}