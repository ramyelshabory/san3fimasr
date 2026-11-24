import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { useFactories } from "@/lib/factories";
import { usePlatform } from "@/lib/platform";

export const Route = createFileRoute("/admin/accounts")({ component: AccountsPage });

function AccountsPage() {
  const factories = useFactories((state) => state.factories);
  const plans = usePlatform((state) => state.plans);
  const setPlan = usePlatform((state) => state.setPlan);

  return (
    <DashboardShell>
      <Gate moduleId="accounts">
        <h1 className="mb-2 text-3xl font-extrabold">الحسابات والاشتراك</h1>
        <p className="mb-6 text-sm leading-6 text-muted">
          المنصة مجانية للمصانع والعملاء السنة الأولى. بعدها الحساب يتحول لاشتراك. تقدر تبدّل
          الحالة يدويًا من هنا.
        </p>
        <div className="grid gap-3">
          {factories.map((factory) => {
            const plan = plans[factory.id] ?? "free";
            return (
              <article
                key={factory.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4"
              >
                <div>
                  <h2 className="font-bold">{factory.name}</h2>
                  <p className="mt-1 text-sm text-muted">{factory.area}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPlan(factory.id, "free")}
                    className={
                      "h-11 rounded-xl px-4 text-sm font-bold " +
                      (plan === "free" ? "bg-primary text-primary-fg" : "border border-line")
                    }
                  >
                    مجاني — السنة الأولى
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan(factory.id, "subscribed")}
                    className={
                      "h-11 rounded-xl px-4 text-sm font-bold " +
                      (plan === "subscribed" ? "bg-accent text-accent-fg" : "border border-line")
                    }
                  >
                    مشترك
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </Gate>
    </DashboardShell>
  );
}
