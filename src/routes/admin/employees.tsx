import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { MODULES, usePlatform, type ModuleId } from "@/lib/platform";

export const Route = createFileRoute("/admin/employees")({ component: EmployeesPage });

function EmployeesPage() {
  const employees = usePlatform((state) => state.employees);
  const addEmployee = usePlatform((state) => state.addEmployee);
  const togglePermission = usePlatform((state) => state.togglePermission);
  const removeEmployee = usePlatform((state) => state.removeEmployee);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <DashboardShell>
      <Gate moduleId="employees">
        <h1 className="mb-2 text-3xl font-extrabold">الموظفون والصلاحيات</h1>
        <p className="mb-6 text-sm text-muted">
          كل موظف يشوف أقسامه بس. جرّب التغيير من «تعمل بصلاحية» أسفل القائمة.
        </p>
        <form
          className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-4 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            addEmployee({
              name: name.trim(),
              role: role.trim() || "موظف",
              phone: phone.trim(),
              permissions: ["overview"],
            });
            setName("");
            setRole("");
            setPhone("");
          }}
        >
          <input className="field" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} aria-label="الاسم" />
          <input className="field" placeholder="الوظيفة" value={role} onChange={(e) => setRole(e.target.value)} aria-label="الوظيفة" />
          <input className="field" placeholder="التليفون" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="التليفون" />
          <button className="h-11 rounded-xl bg-primary font-bold text-primary-fg">إضافة</button>
        </form>
        <div className="grid gap-4">
          {employees.map((employee) => (
            <article key={employee.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{employee.name}</h2>
                  <p className="text-sm text-muted">
                    {employee.role} · {employee.phone || "بدون تليفون"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeEmployee(employee.id)}
                  className="h-10 rounded-xl border border-line px-3 text-sm font-bold text-bad"
                >
                  حذف
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {MODULES.filter((item) => item.id !== "employees").map((item) => {
                  const on = employee.permissions.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePermission(employee.id, item.id as ModuleId)}
                      className={
                        "h-10 rounded-full px-3 text-sm font-semibold " +
                        (on ? "bg-primary text-primary-fg" : "border border-line bg-bg")
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </Gate>
    </DashboardShell>
  );
}
