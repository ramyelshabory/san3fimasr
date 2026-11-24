import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { money } from "@/lib/factories";
import { orderStatusLabel, usePlatform, type OrderStatus } from "@/lib/platform";

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });

const statuses: OrderStatus[] = ["new", "reviewing", "accepted", "declined"];

function OrdersPage() {
  const orders = usePlatform((state) => state.orders);
  const setOrderStatus = usePlatform((state) => state.setOrderStatus);

  return (
    <DashboardShell>
      <Gate moduleId="orders">
        <h1 className="mb-2 text-3xl font-extrabold">الطلبات والعروض</h1>
        <p className="mb-6 text-sm text-muted">
          سعر المصنع المنشور أو عرض العميل. فريق التشغيل يراجع ويربط الطلب بالمصنع.
        </p>
        <div className="grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold">{order.productName}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {order.factoryName} · {order.buyerName} · {order.phone}
                  </p>
                </div>
                <span className="rounded-full bg-bg px-3 py-1 text-sm font-bold">
                  {order.mode === "listed" ? "سعر المصنع" : "عرض عميل"}
                </span>
              </div>
              <p className="mt-3 text-sm">
                {order.quantity.toLocaleString("ar-EG")} قطعة × {money(order.unitPrice)} ={" "}
                {money(order.quantity * order.unitPrice)}
              </p>
              {order.note ? <p className="mt-2 text-sm text-muted">{order.note}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setOrderStatus(order.id, status)}
                    className={
                      "h-10 rounded-xl px-3 text-sm font-bold " +
                      (order.status === status
                        ? "bg-primary text-primary-fg"
                        : "border border-line")
                    }
                  >
                    {orderStatusLabel(status)}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Gate>
    </DashboardShell>
  );
}
