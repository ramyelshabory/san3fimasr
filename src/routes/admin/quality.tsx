import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { useFactories } from "@/lib/factories";
import { usePlatform, type InspectionResult } from "@/lib/platform";

export const Route = createFileRoute("/admin/quality")({ component: QualityPage });

const results: { id: InspectionResult; label: string }[] = [
  { id: "pending", label: "قيد الفحص" },
  { id: "pass", label: "مطابق" },
  { id: "fail", label: "غير مطابق" },
];

function QualityPage() {
  const factories = useFactories((state) => state.factories);
  const updateFactory = useFactories((state) => state.updateFactory);
  const inspections = usePlatform((state) => state.inspections);
  const addInspection = usePlatform((state) => state.addInspection);
  const [factoryId, setFactoryId] = useState(factories[0]?.id ?? "");
  const [result, setResult] = useState<InspectionResult>("pending");
  const [note, setNote] = useState("");

  return (
    <DashboardShell>
      <Gate moduleId="quality">
        <h1 className="mb-2 text-3xl font-extrabold">رقابة الجودة</h1>
        <p className="mb-6 text-sm text-muted">
          المطابقة تصدر كود تصنيع وتعتمد المصنع فيظهر للعملاء. غير المطابق لا يظهر.
        </p>
        <form
          className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const factory = factories.find((item) => item.id === factoryId);
            if (!factory) return;
            addInspection({
              factoryId: factory.id,
              factoryName: factory.name,
              result,
              note,
            });
            if (result === "pass") {
              const code = factory.qualityCode || `SM-2026-${String(40 + factories.length).padStart(3, "0")}`;
              updateFactory(factory.id, { qualityCode: code, status: "approved" });
            }
            if (result === "fail") updateFactory(factory.id, { status: "rejected" });
            setNote("");
          }}
        >
          <select className="field" value={factoryId} onChange={(e) => setFactoryId(e.target.value)} aria-label="المصنع">
            {factories.map((factory) => (
              <option key={factory.id} value={factory.id}>
                {factory.name}
              </option>
            ))}
          </select>
          <select className="field" value={result} onChange={(e) => setResult(e.target.value as InspectionResult)} aria-label="النتيجة">
            {results.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <textarea className="field" rows={2} placeholder="ملاحظة الفحص" value={note} onChange={(e) => setNote(e.target.value)} aria-label="ملاحظة" />
          <button className="h-11 rounded-xl bg-primary font-bold text-primary-fg">حفظ الفحص</button>
        </form>
        <div className="grid gap-3">
          {inspections.map((item) => (
            <article key={item.id} className="rounded-card border border-line bg-surface p-4">
              <h2 className="font-bold">{item.factoryName}</h2>
              <p className="mt-1 text-sm font-semibold">
                {results.find((result) => result.id === item.result)?.label}
              </p>
              {item.note ? <p className="mt-2 text-sm text-muted">{item.note}</p> : null}
            </article>
          ))}
        </div>
      </Gate>
    </DashboardShell>
  );
}
