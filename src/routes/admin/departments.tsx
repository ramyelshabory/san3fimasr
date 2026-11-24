import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { usePlatform } from "@/lib/platform";

export const Route = createFileRoute("/admin/departments")({ component: DepartmentsPage });

function DepartmentsPage() {
  const departments = usePlatform((state) => state.departments);
  const addDepartment = usePlatform((state) => state.addDepartment);
  const [name, setName] = useState("");
  const [duty, setDuty] = useState("");

  return (
    <DashboardShell>
      <Gate moduleId="departments">
        <h1 className="mb-2 text-3xl font-extrabold">الأقسام</h1>
        <p className="mb-6 text-sm text-muted">أضف قسمًا جديدًا لما التشغيل يحتاج تخصصًا زيادة.</p>
        <form
          className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            addDepartment({ name: name.trim(), duty: duty.trim() });
            setName("");
            setDuty("");
          }}
        >
          <input className="field" placeholder="اسم القسم" value={name} onChange={(e) => setName(e.target.value)} aria-label="اسم القسم" />
          <textarea className="field" rows={2} placeholder="وظيفته" value={duty} onChange={(e) => setDuty(e.target.value)} aria-label="وظيفة القسم" />
          <button className="h-11 rounded-xl bg-primary font-bold text-primary-fg">إضافة قسم</button>
        </form>
        <div className="grid gap-3 md:grid-cols-2">
          {departments.map((department) => (
            <article key={department.id} className="rounded-card border border-line bg-surface p-4">
              <h2 className="font-bold">{department.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{department.duty}</p>
            </article>
          ))}
        </div>
      </Gate>
    </DashboardShell>
  );
}
