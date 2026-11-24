import type { ReactNode } from "react";
import { canAccess, usePlatform, type ModuleId } from "@/lib/platform";

export function Gate({ moduleId, children }: { moduleId: ModuleId; children: ReactNode }) {
  const employees = usePlatform((state) => state.employees);
  const active = usePlatform((state) => state.activeEmployeeId);
  if (!canAccess(employees, active, moduleId)) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <h1 className="text-xl font-bold">خارج الصلاحية</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          الحساب الحالي لا يملك صلاحية هذا القسم. غيّر «تعمل بصلاحية» من أسفل القائمة.
        </p>
      </div>
    );
  }
  return children;
}
