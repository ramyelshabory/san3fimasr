import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { OperationsPanel } from "@/components/operations-panel";
import { DashboardShell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import {
  MACHINE_TYPES,
  SPECIALTIES,
  machineTotal,
  useFactories,
} from "@/lib/factories";

export const Route = createFileRoute("/factories/$factoryId")({
  component: FactoryPage,
});

const tabs = [
  { id: "profile", label: "الملف" },
  { id: "machines", label: "المكن والقدرة" },
  { id: "products", label: "المنتجات والأسعار" },
  { id: "ops", label: "التشغيل" },
] as const;

function FactoryPage() {
  const { factoryId } = Route.useParams();
  const factory = useFactories((state) => state.factories.find((item) => item.id === factoryId));
  const setStatus = useFactories((state) => state.setStatus);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("profile");

  if (!factory) {
    return (
      <DashboardShell>
        <div className="rounded-card border border-line bg-surface p-8 text-center">
          <h1 className="text-xl font-bold">المصنع غير موجود</h1>
          <Link to="/factories" className="mt-4 inline-block font-bold text-primary">
            العودة للمصانع
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <nav className="mb-4 text-sm text-muted">
        <Link to="/admin" className="font-semibold hover:text-ink">
          لوحة التحكم
        </Link>
        <span> / </span>
        <Link to="/factories" className="font-semibold hover:text-ink">
          المصانع
        </Link>
        <span> / </span>
        <span className="text-ink">{factory.name}</span>
      </nav>

      <section className="overflow-hidden rounded-card border border-line bg-surface">
        <img src={factory.cover} alt="" className="h-48 w-full object-cover md:h-64" />
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold">{factory.name}</h1>
              <StatusBadge status={factory.status} />
            </div>
            <p className="mt-1 text-sm text-muted">{factory.area || "بدون منطقة"}</p>
            <p className="mt-3 text-sm">
              كود الجودة:{" "}
              <span className="font-bold">{factory.qualityCode || "لم يُصدر بعد"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusButton
              label="اعتماد"
              active={factory.status === "approved"}
              onClick={() => setStatus(factory.id, "approved")}
            />
            <StatusButton
              label="مراجعة"
              active={factory.status === "pending"}
              onClick={() => setStatus(factory.id, "pending")}
            />
            <StatusButton
              label="رفض"
              active={factory.status === "rejected"}
              onClick={() => setStatus(factory.id, "rejected")}
            />
            <StatusButton
              label="إيقاف"
              active={factory.status === "suspended"}
              onClick={() => setStatus(factory.id, "suspended")}
            />
          </div>
        </div>
        <dl className="grid grid-cols-3 border-t border-line text-center">
          <Metric label="الماكينات" value={String(machineTotal(factory))} />
          <Metric
            label="قطعة / يوم"
            value={factory.dailyCapacity.toLocaleString("ar-EG")}
          />
          <Metric label="المنتجات" value={String(factory.products.length)} />
        </dl>
      </section>

      <div className="mt-5 flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              "h-11 shrink-0 rounded-full px-4 text-sm font-bold " +
              (tab === item.id
                ? "bg-primary text-primary-fg"
                : "border border-line bg-surface text-ink")
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "profile" ? <ProfileTab factoryId={factory.id} /> : null}
        {tab === "machines" ? <MachinesTab factoryId={factory.id} /> : null}
        {tab === "products" ? <ProductsTab factoryId={factory.id} /> : null}
        {tab === "ops" ? <OperationsPanel factoryId={factory.id} /> : null}
      </div>
    </DashboardShell>
  );
}

function StatusButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-11 rounded-xl px-4 text-sm font-bold " +
        (active
          ? "bg-accent text-accent-fg"
          : "border border-line bg-bg text-ink hover:border-accent")
      }
    >
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-4">
      <dd className="text-xl font-extrabold text-primary">{value}</dd>
      <dt className="text-xs text-muted">{label}</dt>
    </div>
  );
}

function ProfileTab({ factoryId }: { factoryId: string }) {
  const factory = useFactories((state) => state.factories.find((item) => item.id === factoryId)!);
  const updateFactory = useFactories((state) => state.updateFactory);
  const sections = useFactories((state) => state.sections);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    name: factory.name,
    sectionId: factory.sectionId,
    phone: factory.phone,
    area: factory.area,
    address: factory.address,
    qualityCode: factory.qualityCode,
    notes: factory.notes,
    dailyCapacity: factory.dailyCapacity,
    specialties: factory.specialties,
  });

  useEffect(() => {
    if (window.location.hash === "#edit") startEdit();
    // Only open the form when arriving from the list's edit button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit() {
    setDraft({
      name: factory.name,
      sectionId: factory.sectionId,
      phone: factory.phone,
      area: factory.area,
      address: factory.address,
      qualityCode: factory.qualityCode,
      notes: factory.notes,
      dailyCapacity: factory.dailyCapacity,
      specialties: [...factory.specialties],
    });
    setError("");
    setSaved(false);
    setEditing(true);
  }

  function save() {
    if (!draft.name.trim()) {
      setError("اسم المصنع مطلوب.");
      return;
    }
    updateFactory(factory.id, {
      ...draft,
      name: draft.name.trim(),
      dailyCapacity: Number(draft.dailyCapacity) || 0,
    });
    setEditing(false);
    setSaved(true);
    setError("");
  }

  function toggleSpecialty(specialty: string) {
    setDraft((current) => ({
      ...current,
      specialties: current.specialties.includes(specialty)
        ? current.specialties.filter((item) => item !== specialty)
        : [...current.specialties, specialty],
    }));
  }

  if (!editing) {
    return (
      <section id="edit" className="rounded-card border border-line bg-surface p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">بيانات المصنع</h2>
          <button
            type="button"
            onClick={startEdit}
            className="h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-fg"
          >
            تعديل البيانات
          </button>
        </div>
        {saved ? (
          <p className="mb-4 rounded-xl bg-ok-bg px-3 py-2 text-sm font-semibold text-ok">
            تم حفظ التعديلات.
          </p>
        ) : null}
        <dl className="grid gap-4 md:grid-cols-2">
          <Info label="اسم المصنع" value={factory.name} />
          <Info label="القسم" value={sections.find((section) => section.id === factory.sectionId)?.name || "—"} />
          <Info label="التليفون" value={factory.phone || "—"} />
          <Info label="المنطقة" value={factory.area || "—"} />
          <Info label="كود الجودة" value={factory.qualityCode || "لم يُصدر بعد"} />
          <Info label="القدرة اليومية" value={`${factory.dailyCapacity.toLocaleString("ar-EG")} قطعة`} />
          <Info label="العنوان" value={factory.address || "—"} wide />
          <Info label="ملاحظات الجودة" value={factory.notes || "—"} wide />
          <div className="md:col-span-2">
            <dt className="text-xs font-bold text-muted">التخصصات</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {factory.specialties.length ? (
                factory.specialties.map((specialty) => (
                  <span key={specialty} className="rounded-full bg-bg px-3 py-1 text-sm font-semibold">
                    {specialty}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted">—</span>
              )}
            </dd>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <section id="edit" className="grid gap-4 rounded-card border border-line bg-surface p-4 md:grid-cols-2 md:p-6">
      <div className="md:col-span-2">
        <h2 className="font-bold">تعديل بيانات المصنع</h2>
        <p className="mt-1 text-sm text-muted">التغييرات ما بتتحفظش غير لما تضغط حفظ.</p>
      </div>
      <Field label="اسم المصنع">
        <input
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          className="field"
        />
      </Field>
      <Field label="قسم التصنيع">
        <select
          className="field"
          value={draft.sectionId}
          onChange={(event) => setDraft({ ...draft, sectionId: event.target.value })}
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="التليفون">
        <input
          value={draft.phone}
          onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
          className="field"
          inputMode="tel"
        />
      </Field>
      <Field label="المنطقة">
        <input
          value={draft.area}
          onChange={(event) => setDraft({ ...draft, area: event.target.value })}
          className="field"
        />
      </Field>
      <Field label="كود الجودة">
        <input
          value={draft.qualityCode}
          onChange={(event) => setDraft({ ...draft, qualityCode: event.target.value })}
          className="field"
        />
      </Field>
      <Field label="القدرة اليومية (قطعة)">
        <input
          type="number"
          min={0}
          value={draft.dailyCapacity}
          onChange={(event) =>
            setDraft({ ...draft, dailyCapacity: Number(event.target.value) || 0 })
          }
          className="field"
        />
      </Field>
      <Field label="العنوان" wide>
        <input
          value={draft.address}
          onChange={(event) => setDraft({ ...draft, address: event.target.value })}
          className="field"
        />
      </Field>
      <Field label="ملاحظات الجودة" wide>
        <textarea
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          rows={3}
          className="field"
        />
      </Field>
      <div className="md:col-span-2">
        <p className="mb-2 text-sm font-bold">التخصصات</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((specialty) => {
            const on = draft.specialties.includes(specialty);
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => toggleSpecialty(specialty)}
                className={
                  "h-10 rounded-full px-4 text-sm font-semibold " +
                  (on ? "bg-primary text-primary-fg" : "border border-line bg-bg")
                }
              >
                {specialty}
              </button>
            );
          })}
        </div>
      </div>
      {error ? <p className="text-sm font-semibold text-bad md:col-span-2">{error}</p> : null}
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <button
          type="button"
          onClick={save}
          className="h-11 rounded-xl bg-primary px-5 font-bold text-primary-fg"
        >
          حفظ التعديلات
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setError("");
          }}
          className="h-11 rounded-xl border border-line px-5 font-bold"
        >
          إلغاء
        </button>
      </div>
    </section>
  );
}

function MachinesTab({ factoryId }: { factoryId: string }) {
  const factory = useFactories((state) => state.factories.find((item) => item.id === factoryId)!);
  const addMachine = useFactories((state) => state.addMachine);
  const updateMachine = useFactories((state) => state.updateMachine);
  const removeMachine = useFactories((state) => state.removeMachine);

  return (
    <section className="rounded-card border border-line bg-surface p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">أنواع المكن</h2>
        <button
          type="button"
          onClick={() => addMachine(factory.id)}
          className="inline-flex h-10 items-center gap-1 rounded-xl bg-primary px-3 text-sm font-bold text-primary-fg"
        >
          <Plus className="size-4" />
          ماكينة
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {factory.machines.map((machine, index) => (
          <div key={`${machine.type}-${index}`} className="grid grid-cols-[1fr_7rem_auto] gap-2">
            <select
              value={machine.type}
              onChange={(event) => updateMachine(factory.id, index, { type: event.target.value })}
              className="field"
            >
              {MACHINE_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              value={machine.count}
              onChange={(event) =>
                updateMachine(factory.id, index, { count: Number(event.target.value) || 0 })
              }
              className="field"
              aria-label="العدد"
            />
            <button
              type="button"
              onClick={() => removeMachine(factory.id, index)}
              className="grid size-11 place-items-center rounded-xl border border-line text-bad"
              aria-label="حذف الماكينة"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {factory.machines.length === 0 ? (
          <p className="text-sm text-muted">لا يوجد مكن مسجّل بعد.</p>
        ) : null}
      </div>
    </section>
  );
}

function ProductsTab({ factoryId }: { factoryId: string }) {
  const factory = useFactories((state) => state.factories.find((item) => item.id === factoryId)!);
  const addProduct = useFactories((state) => state.addProduct);
  const updateProduct = useFactories((state) => state.updateProduct);
  const removeProduct = useFactories((state) => state.removeProduct);
  const addTier = useFactories((state) => state.addTier);
  const updateTier = useFactories((state) => state.updateTier);
  const removeTier = useFactories((state) => state.removeTier);

  return (
    <section className="grid gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => addProduct(factory.id)}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-fg"
        >
          <Plus className="size-4" />
          منتج
        </button>
      </div>
      {factory.products.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          المصنع لسه ما أضافش منتجات. أضف منتجًا مع سعر حسب الكمية.
        </p>
      ) : null}
      {factory.products.map((product) => (
        <article key={product.id} className="rounded-card border border-line bg-surface p-4 md:p-5">
          <div className="flex gap-4">
            <img src={product.image} alt="" className="size-20 rounded-xl object-cover" />
            <div className="grid flex-1 gap-3 md:grid-cols-3">
              <input
                value={product.name}
                onChange={(event) =>
                  updateProduct(factory.id, product.id, { name: event.target.value })
                }
                className="field md:col-span-2"
                aria-label="اسم المنتج"
              />
              <button
                type="button"
                onClick={() => removeProduct(factory.id, product.id)}
                className="h-11 rounded-xl border border-line text-sm font-bold text-bad"
              >
                حذف المنتج
              </button>
              <input
                value={product.category}
                onChange={(event) =>
                  updateProduct(factory.id, product.id, { category: event.target.value })
                }
                className="field"
                aria-label="التصنيف"
              />
              <input
                value={product.fabric}
                onChange={(event) =>
                  updateProduct(factory.id, product.id, { fabric: event.target.value })
                }
                className="field md:col-span-2"
                aria-label="الخامة"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold">جدول الأسعار</h3>
              <button
                type="button"
                onClick={() => addTier(factory.id, product.id)}
                className="text-sm font-bold text-primary"
              >
                + شريحة
              </button>
            </div>
            <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1 text-xs text-muted md:grid">
              <span>من كمية</span>
              <span>إلى كمية</span>
              <span>سعر القطعة</span>
              <span />
            </div>
            <div className="mt-2 grid gap-2">
              {product.tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <input
                    type="number"
                    min={1}
                    value={tier.min}
                    onChange={(event) =>
                      updateTier(factory.id, product.id, index, {
                        min: Number(event.target.value) || 0,
                      })
                    }
                    className="field"
                    aria-label="من كمية"
                  />
                  <input
                    type="number"
                    min={0}
                    value={tier.max ?? ""}
                    placeholder="فأكثر"
                    onChange={(event) =>
                      updateTier(factory.id, product.id, index, {
                        max: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    className="field"
                    aria-label="إلى كمية"
                  />
                  <input
                    type="number"
                    min={0}
                    value={tier.price}
                    onChange={(event) =>
                      updateTier(factory.id, product.id, index, {
                        price: Number(event.target.value) || 0,
                      })
                    }
                    className="field col-span-2 md:col-span-1"
                    aria-label="السعر"
                  />
                  <button
                    type="button"
                    onClick={() => removeTier(factory.id, product.id, index)}
                    className="grid size-11 place-items-center rounded-xl border border-line text-bad"
                    aria-label="حذف الشريحة"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-6">{value}</dd>
    </div>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
