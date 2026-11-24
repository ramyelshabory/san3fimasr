import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { consultStatusLabel, usePlatform, type ConsultStatus } from "@/lib/platform";

export const Route = createFileRoute("/admin/consultations")({ component: ConsultationsPage });

const statuses: ConsultStatus[] = ["new", "in_progress", "done"];

function ConsultationsPage() {
  const consultations = usePlatform((state) => state.consultations);
  const setConsultationStatus = usePlatform((state) => state.setConsultationStatus);

  return (
    <DashboardShell>
      <Gate moduleId="consultations">
        <h1 className="mb-2 text-3xl font-extrabold">استشارات المستثمرين</h1>
        <p className="mb-6 text-sm text-muted">
          الطلبات الجاية من صفحة الاستشارات: المنتج، الجمهور، التسويق، والربح.
        </p>
        <div className="grid gap-3">
          {consultations.map((item) => (
            <article key={item.id} className="rounded-card border border-line bg-surface p-4">
              <h2 className="font-bold">{item.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {item.phone} · رأس المال: {item.capital || "غير محدد"}
              </p>
              <p className="mt-3 text-sm">
                <span className="font-bold">الفكرة: </span>
                {item.idea}
              </p>
              {item.target ? (
                <p className="mt-1 text-sm">
                  <span className="font-bold">الجمهور: </span>
                  {item.target}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setConsultationStatus(item.id, status)}
                    className={
                      "h-10 rounded-xl px-3 text-sm font-bold " +
                      (item.status === status ? "bg-accent text-accent-fg" : "border border-line")
                    }
                  >
                    {consultStatusLabel(status)}
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
