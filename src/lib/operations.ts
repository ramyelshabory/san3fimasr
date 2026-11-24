import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DOWNTIME_REASONS = [
  { id: "mechanical", label: "عطل ميكانيكي" },
  { id: "electrical", label: "عطل كهربائي" },
  { id: "material", label: "نقص خامات" },
  { id: "setup", label: "تغيير قالب / تجهيز" },
  { id: "maintenance", label: "صيانة دورية" },
] as const;

export const DEFECT_KINDS = [
  { id: "dimension", label: "عيوب أبعاد" },
  { id: "color", label: "عيوب لون" },
  { id: "packaging", label: "سوء تغليف" },
  { id: "other", label: "سبب آخر" },
] as const;

export const SHIFTS = [
  { id: "morning", label: "صباحية" },
  { id: "evening", label: "مسائية" },
  { id: "night", label: "ليلية" },
] as const;

export type DowntimeReason = (typeof DOWNTIME_REASONS)[number]["id"];
export type DefectKind = (typeof DEFECT_KINDS)[number]["id"];
export type ShiftId = (typeof SHIFTS)[number]["id"];

export type OpsSnapshot = {
  factoryId: string;
  actualUnits: number;
  plannedUnits: number;
  cycleActualMin: number;
  cycleStandardMin: number;
  throughputHours: number;
  uptimeHours: number;
  downtimeHours: number;
  downtimeReason: DowntimeReason;
  failures: number;
  repairMinutes: number;
  defectUnits: number;
  defectKind: DefectKind;
  scrapUnits: number;
  scrapUnitCost: number;
  firstPassUnits: number;
  materialDrawn: number;
  materialUsed: number;
  materialUnitCost: number;
  energyKwh: number;
  gasM3: number;
  airM3: number;
  waterM3: number;
  utilityCost: number;
  wipUnits: number;
  shift: ShiftId;
  shiftOutput: number;
  shiftDefects: number;
  operatorHours: number;
  standardOperatorHours: number;
  laborCost: number;
  machineDepreciation: number;
  lostSalesPerHour: number;
  reworkCost: number;
  returnsCost: number;
};

export function emptyOps(factoryId: string): OpsSnapshot {
  return {
    factoryId,
    actualUnits: 0,
    plannedUnits: 0,
    cycleActualMin: 0,
    cycleStandardMin: 0,
    throughputHours: 8,
    uptimeHours: 0,
    downtimeHours: 0,
    downtimeReason: "mechanical",
    failures: 0,
    repairMinutes: 0,
    defectUnits: 0,
    defectKind: "dimension",
    scrapUnits: 0,
    scrapUnitCost: 0,
    firstPassUnits: 0,
    materialDrawn: 0,
    materialUsed: 0,
    materialUnitCost: 0,
    energyKwh: 0,
    gasM3: 0,
    airM3: 0,
    waterM3: 0,
    utilityCost: 0,
    wipUnits: 0,
    shift: "morning",
    shiftOutput: 0,
    shiftDefects: 0,
    operatorHours: 0,
    standardOperatorHours: 0,
    laborCost: 0,
    machineDepreciation: 0,
    lostSalesPerHour: 0,
    reworkCost: 0,
    returnsCost: 0,
  };
}

const seed: OpsSnapshot[] = [
  {
    ...emptyOps("kheir"),
    actualUnits: 3600,
    plannedUnits: 4000,
    cycleActualMin: 1.4,
    cycleStandardMin: 1.2,
    throughputHours: 8,
    uptimeHours: 6.5,
    downtimeHours: 1.5,
    downtimeReason: "setup",
    failures: 2,
    repairMinutes: 50,
    defectUnits: 140,
    defectKind: "dimension",
    scrapUnits: 80,
    scrapUnitCost: 35,
    firstPassUnits: 3400,
    materialDrawn: 3900,
    materialUsed: 3680,
    materialUnitCost: 42,
    energyKwh: 860,
    gasM3: 40,
    airM3: 120,
    waterM3: 18,
    utilityCost: 2400,
    wipUnits: 220,
    shift: "morning",
    shiftOutput: 3600,
    shiftDefects: 140,
    operatorHours: 64,
    standardOperatorHours: 72,
    laborCost: 9600,
    machineDepreciation: 1800,
    lostSalesPerHour: 1200,
    reworkCost: 700,
    returnsCost: 300,
  },
];

type Store = {
  snapshots: OpsSnapshot[];
  save: (snapshot: OpsSnapshot) => void;
};

export const useOperations = create<Store>()(
  persist(
    (set) => ({
      snapshots: seed,
      save: (snapshot) =>
        set((state) => {
          const exists = state.snapshots.some((item) => item.factoryId === snapshot.factoryId);
          return {
            snapshots: exists
              ? state.snapshots.map((item) => (item.factoryId === snapshot.factoryId ? snapshot : item))
              : [snapshot, ...state.snapshots],
          };
        }),
    }),
    {
      name: "san3fimasr-ops",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const ids = new Set(state.snapshots.map((item) => item.factoryId));
        const missing = seed.filter((item) => !ids.has(item.factoryId));
        if (missing.length) useOperations.setState({ snapshots: [...state.snapshots, ...missing] });
      },
    },
  ),
);

export function opsFor(snapshots: OpsSnapshot[], factoryId: string) {
  return snapshots.find((item) => item.factoryId === factoryId) ?? emptyOps(factoryId);
}

function ratio(part: number, total: number) {
  if (total <= 0 || part < 0) return 0;
  return Math.min(1, part / total);
}

export function opsMetrics(ops: OpsSnapshot) {
  const availability = ratio(ops.uptimeHours, ops.uptimeHours + ops.downtimeHours);
  const performance =
    ops.cycleActualMin > 0 ? Math.min(1, ops.cycleStandardMin / ops.cycleActualMin) : 0;
  const quality = ratio(ops.firstPassUnits, ops.actualUnits);
  const oee = availability * performance * quality;
  const delay = ops.plannedUnits - ops.actualUnits;
  const throughput = ops.throughputHours > 0 ? ops.actualUnits / ops.throughputHours : 0;
  const mtbf = ops.failures > 0 ? ops.uptimeHours / ops.failures : null;
  const mttr = ops.failures > 0 ? ops.repairMinutes / ops.failures : null;
  const defectRate = ratio(ops.defectUnits, ops.actualUnits);
  const scrapCost = ops.scrapUnits * ops.scrapUnitCost;
  const materialWaste = Math.max(0, ops.materialDrawn - ops.materialUsed);
  const materialCost = ops.materialUsed * ops.materialUnitCost;
  const unitCost =
    ops.actualUnits > 0
      ? (materialCost + ops.utilityCost + ops.machineDepreciation + ops.laborCost) / ops.actualUnits
      : 0;
  const idleLabor =
    ops.uptimeHours + ops.downtimeHours > 0
      ? ops.laborCost * (ops.downtimeHours / (ops.uptimeHours + ops.downtimeHours))
      : 0;
  const downtimeCost = idleLabor + ops.downtimeHours * ops.lostSalesPerHour;
  const copq = scrapCost + ops.reworkCost + ops.returnsCost;
  const laborPerUnit = ops.actualUnits > 0 ? ops.laborCost / ops.actualUnits : 0;
  const shiftDefectRate = ratio(ops.shiftDefects, ops.shiftOutput);
  return {
    availability,
    performance,
    quality,
    oee,
    delay,
    throughput,
    mtbf,
    mttr,
    defectRate,
    scrapCost,
    materialWaste,
    materialCost,
    unitCost,
    downtimeCost,
    copq,
    operatorEfficiency: ratio(ops.operatorHours > 0 ? ops.standardOperatorHours : 0, ops.operatorHours || 1),
    laborPerUnit,
    shiftDefectRate,
    fpy: quality,
  };
}

export function percent(value: number) {
  return `${Math.round(value * 100).toLocaleString("ar-EG")}٪`;
}
