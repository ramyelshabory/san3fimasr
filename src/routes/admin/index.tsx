import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { StatusBadge } from "@/components/status-badge";
import { machineTotal, useFactories } from "@/lib/factories";
import { orderStatusLabel, usePlatform } from "@/lib/platform";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
  head: () => ({ meta: [{ title: "لوحة التحكم — صنع في مصر" }] }),
});

function AdminHome() {
  const factories = useFactories((state) => state.factories);
  const orders = usePlatform((state) => state.orders);
  const consultations = usePlatform((state) => state.consultations);
  const visits = usePlatform((state) => state.visits);
  const inspections = usePlatform((state) => state.inspections);
  const approved = factories.filter((factory) => factory.status === "approved").length;
  const pendingFactories = factories.filter((factory) => factory.status === "pending");
  const pending = pendingFactories.length;
  const pendingQuality = inspections.filter((inspection) => inspection.result === "pending").length;
  const capacity = factories.reduce((sum, factory) => sum + factory.dailyCapacity, 0);

  return (
    <DashboardShell>
      <Gate moduleId="overview">
        <header className="mb-6">
          <p className="text-sm font-semibold text-accent">لوحة التحكم</p>
          <h1 className="mt-1 text-3xl font-extrabold">نظرة عامة</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            المصانع، الطلبات، زيارات الأرض، واستشارات أصحاب رؤوس الأموال في مكان واحد.
          </p>
        </header>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="المصانع" value={String(factories.length)} />
          <Stat label="معتمدة" value={String(approved)} />
          <Stat label="قيد المراجعة" value={String(pending)} to={pending > 0 ? "/factories" : undefined} />
          <Stat label="طاقة يومية" value={capacity.toLocaleString("ar-EG")} />
          <Stat label="الطلبات" value={String(orders.length)} />
          <Stat label="زيارات ميدانية" value={String(visits.length)} />
          <Stat label="استشارات" value={String(consultations.length)} />
          <Stat
            label="فحوصات جودة قيد الانتظار"
            value={String(pendingQuality)}
            to={pendingQuality > 0 ? "/admin/quality" : undefined}
          />
        </section>
        {pendingFactories.length > 0 ? (
          <section className="mt-6 rounded-card border border-accent/40 bg-accent/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">
                {pendingFactories.length.toLocaleString("ar-EG")} مصنع محتاج مراجعة قبل الظهور للعملاء
              </p>
              <Link to="/factories" className="text-sm font-bold text-primary">
                راجع دلوقتي
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {pendingFactories.slice(0, 6).map((factory) => (
                <span
                  key={factory.id}
                  className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-bold"
                >
                  {factory.name}
                </span>
              ))}
            </div>
          </section>
        ) : null}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">آخر المصانع</h2>
              <Link to="/factories" className="text-sm font-bold text-primary">
                الكل
              </Link>
            </div>
            {factories.length === 0 ? (
              <EmptyState text="لسه مفيش مصانع مضافة." />
            ) : (
              <div className="grid gap-3">
                {factories.slice(0, 4).map((factory) => (
                  <Link
                    key={factory.id}
                    to="/factories/$factoryId"
                    params={{ factoryId: factory.id }}
                    className="flex items-center gap-3 rounded-card border border-line bg-surface p-3"
                  >
                    <img src={factory.cover} alt="" className="size-14 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{factory.name}</p>
                        <StatusBadge status={factory.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {machineTotal(factory)} ماكينة · {factory.dailyCapacity.toLocaleString("ar-EG")}{" "}
                        قطعة/يوم
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">آخر الطلبات</h2>
              <Link to="/admin/orders" className="text-sm font-bold text-primary">
                الكل
              </Link>
            </div>
            {orders.length === 0 ? (
              <EmptyState text="لسه مفيش طلبات واردة." />
            ) : (
              <div className="grid gap-3">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="rounded-card border border-line bg-surface p-3">
                    <p className="font-bold">
                      {order.productName} · {order.quantity.toLocaleString("ar-EG")} قطعة
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {order.factoryName} · {order.buyerName} · {orderStatusLabel(order.status)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </Gate>
    </DashboardShell>
  );
}

function Stat({ label, value, to }: { label: string; value: string; to?: string }) {
  const content = (
    <>
      <p className="text-2xl font-extrabold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        className="rounded-card border border-line bg-surface p-4 ring-accent/40 transition hover:ring-2"
      >
        {content}
      </Link>
    );
  }
  return <div className="rounded-card border border-line bg-surface p-4">{content}</div>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface p-8 text-center">
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
