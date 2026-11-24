import type { FactoryStatus } from "@/lib/factories";
import { statusLabel } from "@/lib/factories";

const styles: Record<FactoryStatus, string> = {
  approved: "bg-ok-bg text-ok",
  pending: "bg-warn-bg text-warn",
  rejected: "bg-bad-bg text-bad",
  suspended: "bg-line text-muted",
};

export function StatusBadge({ status }: { status: FactoryStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
