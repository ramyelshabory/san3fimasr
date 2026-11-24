import { useEffect, useState } from "react";
import {
  DEFECT_KINDS,
  DOWNTIME_REASONS,
  SHIFTS,
  emptyOps,
  opsMetrics,
  percent,
  useOperations,
  type OpsSnapshot,
} from "@/lib/operations";
import { money } from "@/lib/factories";

export function OperationsPanel({ factoryId }: { factoryId: string }) {
  const saved = useOperations((state) => state.snapshots.find((item) => item.factoryId === factoryId));
  const save = useOperations((state) => state.save);
  const [draft, setDraft] = useState<OpsSnapshot>(saved ?? emptyOps(factoryId));
  const metrics = opsMetrics(draft);

  useEffect(() => {
    setDraft(saved ?? emptyOps(factoryId));
  }, [factoryId, saved]);

  function setNumber(key: keyof OpsSnapshot, value: string) {
    setDraft((current) => ({ ...current, [key]: Number(value) || 0 }));
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="كفاءة المعدات OEE" value={percent(metrics.oee)} hint="إتاحة × أداء × جودة" />
        <Kpi
          label="الإنتاج مقابل الخطة"
          value={`${draft.actualUnits.toLocaleString("ar-EG")} / ${draft.plannedUnits.toLocaleString("ar-EG")}`}
          hint={metrics.delay > 0 ? `تأخير ${metrics.delay.toLocaleString("ar-EG")} وحدة` : "على الخطة أو أسرع"}
        />
        <Kpi label="زمن الدورة" value={`${draft.cycleActualMin} د`} hint={`المعيار ${draft.cycleStandardMin} د`} />
        <Kpi label="الإنتاجية" value={`${Math.round(metrics.throughput).toLocaleString("ar-EG")} / س`} hint="وحدات خلال الفترة" />
        <Kpi label="MTBF" value={metrics.mtbf == null ? "—" : `${metrics.mtbf.toFixed(1)} س`} hint="متوسط الوقت بين الأعطال" />
        <Kpi label="MTTR" value={metrics.mttr == null ? "—" : `${Math.round(metrics.mttr)} د`} hint="متوسط وقت الإصلاح" />
        <Kpi label="نسبة العيوب" value={percent(metrics.defectRate)} hint={DEFECT_KINDS.find((item) => item.id === draft.defectKind)?.label} />
        <Kpi label="العائد من أول مرة" value={percent(metrics.fpy)} hint="بدون إعادة تشغيل" />
        <Kpi label="تكلفة الوحدة" value={money(Math.round(metrics.unitCost))} hint="خامات + طاقة + إهلاك + عمالة" />
        <Kpi label="تكلفة التوقف" value={money(Math.round(metrics.downtimeCost))} hint="عمالة معطلة + بيع ضائع" />
        <Kpi label="تكلفة الجودة الرديئة" value={money(Math.round(metrics.copq))} hint="هالك + إعادة تشغيل + مرتجعات" />
        <Kpi label="هدر الخامات" value={metrics.materialWaste.toLocaleString("ar-EG")} hint="مسحوب − مستخدم" />
      </div>

      <Group title="الإنتاج والتشغيل">
        <Num label="الإنتاج الفعلي" value={draft.actualUnits} onChange={(value) => setNumber("actualUnits", value)} />
        <Num label="الخطة المستهدفة" value={draft.plannedUnits} onChange={(value) => setNumber("plannedUnits", value)} />
        <Num label="زمن الدورة الفعلي (دقيقة)" value={draft.cycleActualMin} onChange={(value) => setNumber("cycleActualMin", value)} />
        <Num label="زمن الدورة المعياري" value={draft.cycleStandardMin} onChange={(value) => setNumber("cycleStandardMin", value)} />
        <Num label="ساعات قياس الإنتاجية" value={draft.throughputHours} onChange={(value) => setNumber("throughputHours", value)} />
      </Group>

      <Group title="أداء الماكينات والأعطال">
        <Num label="ساعات التشغيل" value={draft.uptimeHours} onChange={(value) => setNumber("uptimeHours", value)} />
        <Num label="ساعات التوقف" value={draft.downtimeHours} onChange={(value) => setNumber("downtimeHours", value)} />
        <label className="grid gap-1 text-sm font-bold">
          سبب التوقف
          <select className="field" value={draft.downtimeReason} onChange={(event) => setDraft({ ...draft, downtimeReason: event.target.value as OpsSnapshot["downtimeReason"] })}>
            {DOWNTIME_REASONS.map((reason) => (
              <option key={reason.id} value={reason.id}>{reason.label}</option>
            ))}
          </select>
        </label>
        <Num label="عدد الأعطال" value={draft.failures} onChange={(value) => setNumber("failures", value)} />
        <Num label="دقائق الإصلاح" value={draft.repairMinutes} onChange={(value) => setNumber("repairMinutes", value)} />
        <p className="text-sm text-muted sm:col-span-2">الإتاحة {percent(metrics.availability)} · الأداء {percent(metrics.performance)}</p>
      </Group>

      <Group title="الجودة والهالك">
        <Num label="وحدات معيبة" value={draft.defectUnits} onChange={(value) => setNumber("defectUnits", value)} />
        <label className="grid gap-1 text-sm font-bold">
          نوع العيب
          <select className="field" value={draft.defectKind} onChange={(event) => setDraft({ ...draft, defectKind: event.target.value as OpsSnapshot["defectKind"] })}>
            {DEFECT_KINDS.map((kind) => (
              <option key={kind.id} value={kind.id}>{kind.label}</option>
            ))}
          </select>
        </label>
        <Num label="كمية الهالك" value={draft.scrapUnits} onChange={(value) => setNumber("scrapUnits", value)} />
        <Num label="تكلفة وحدة الهالك" value={draft.scrapUnitCost} onChange={(value) => setNumber("scrapUnitCost", value)} />
        <Num label="ناجح من أول فحص" value={draft.firstPassUnits} onChange={(value) => setNumber("firstPassUnits", value)} />
        <p className="text-sm text-muted">تكلفة الهالك {money(Math.round(metrics.scrapCost))}</p>
      </Group>

      <Group title="الموارد والطاقة">
        <Num label="خامات مسحوبة" value={draft.materialDrawn} onChange={(value) => setNumber("materialDrawn", value)} />
        <Num label="خامات مستخدمة" value={draft.materialUsed} onChange={(value) => setNumber("materialUsed", value)} />
        <Num label="سعر وحدة الخام" value={draft.materialUnitCost} onChange={(value) => setNumber("materialUnitCost", value)} />
        <Num label="كهرباء (ك.و.س)" value={draft.energyKwh} onChange={(value) => setNumber("energyKwh", value)} />
        <Num label="غاز (م³)" value={draft.gasM3} onChange={(value) => setNumber("gasM3", value)} />
        <Num label="هواء مضغوط (م³)" value={draft.airM3} onChange={(value) => setNumber("airM3", value)} />
        <Num label="مياه (م³)" value={draft.waterM3} onChange={(value) => setNumber("waterM3", value)} />
        <Num label="تكلفة المرافق" value={draft.utilityCost} onChange={(value) => setNumber("utilityCost", value)} />
        <Num label="مخزون وسيط WIP" value={draft.wipUnits} onChange={(value) => setNumber("wipUnits", value)} />
      </Group>

      <Group title="القوى العاملة">
        <label className="grid gap-1 text-sm font-bold">
          الوردية
          <select className="field" value={draft.shift} onChange={(event) => setDraft({ ...draft, shift: event.target.value as OpsSnapshot["shift"] })}>
            {SHIFTS.map((shift) => (
              <option key={shift.id} value={shift.id}>{shift.label}</option>
            ))}
          </select>
        </label>
        <Num label="إنتاج الوردية" value={draft.shiftOutput} onChange={(value) => setNumber("shiftOutput", value)} />
        <Num label="عيوب الوردية" value={draft.shiftDefects} onChange={(value) => setNumber("shiftDefects", value)} />
        <Num label="ساعات المشغلين" value={draft.operatorHours} onChange={(value) => setNumber("operatorHours", value)} />
        <Num label="الساعات المعيارية" value={draft.standardOperatorHours} onChange={(value) => setNumber("standardOperatorHours", value)} />
        <Num label="تكلفة العمالة المباشرة" value={draft.laborCost} onChange={(value) => setNumber("laborCost", value)} />
        <p className="text-sm text-muted sm:col-span-2">
          كفاءة المشغلين {percent(metrics.operatorEfficiency)} · تكلفة العمالة للوحدة {money(Math.round(metrics.laborPerUnit))} · عيوب الوردية {percent(metrics.shiftDefectRate)}
        </p>
      </Group>

      <Group title="التكلفة المالية">
        <Num label="إهلاك الماكينة للفترة" value={draft.machineDepreciation} onChange={(value) => setNumber("machineDepreciation", value)} />
        <Num label="بيع ضائع لكل ساعة توقف" value={draft.lostSalesPerHour} onChange={(value) => setNumber("lostSalesPerHour", value)} />
        <Num label="تكلفة إعادة التشغيل" value={draft.reworkCost} onChange={(value) => setNumber("reworkCost", value)} />
        <Num label="تكلفة المرتجعات" value={draft.returnsCost} onChange={(value) => setNumber("returnsCost", value)} />
      </Group>

      <button type="button" onClick={() => save(draft)} className="h-12 rounded-xl bg-primary font-bold text-primary-fg">
        حفظ بيانات التشغيل
      </button>
    </div>
  );
}

export function OperationsSummary({ factoryId }: { factoryId: string }) {
  const saved = useOperations((state) => state.snapshots.find((item) => item.factoryId === factoryId));
  if (!saved || saved.actualUnits <= 0) return null;
  const metrics = opsMetrics(saved);
  return (
    <section className="mt-6">
      <h2 className="font-bold">تشغيل اليوم</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Kpi label="OEE" value={percent(metrics.oee)} hint={`${percent(metrics.availability)} إتاحة`} />
        <Kpi label="الإنتاج" value={saved.actualUnits.toLocaleString("ar-EG")} hint={`الخطة ${saved.plannedUnits.toLocaleString("ar-EG")}`} />
        <Kpi label="جودة أول مرة" value={percent(metrics.fpy)} hint={`عيوب ${percent(metrics.defectRate)}`} />
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-card border border-line bg-surface p-4">
      <h2 className="font-extrabold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input className="field" type="number" min={0} step="any" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-card border border-line bg-surface p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}
