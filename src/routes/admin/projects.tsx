import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { projectStageLabel, usePlatform, type ProjectStage } from "@/lib/platform";

export const Route = createFileRoute("/admin/projects")({ component: ProjectsPage });

const stages: ProjectStage[] = ["study", "contract", "production", "delivered"];

function ProjectsPage() {
  const projects = usePlatform((state) => state.projects);
  const addProject = usePlatform((state) => state.addProject);
  const setProjectStage = usePlatform((state) => state.setProjectStage);
  const [form, setForm] = useState({
    name: "",
    client: "",
    factoryName: "",
    stage: "study" as ProjectStage,
    note: "",
  });

  return (
    <DashboardShell>
      <Gate moduleId="projects">
        <h1 className="mb-2 text-3xl font-extrabold">المشروعات</h1>
        <p className="mb-6 text-sm text-muted">من الدراسة للتعاقد ثم التنفيذ والتسليم.</p>
        <form
          className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.name.trim() || !form.client.trim()) return;
            addProject(form);
            setForm({ ...form, name: "", client: "", note: "" });
          }}
        >
          <input className="field" placeholder="اسم المشروع" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="اسم المشروع" />
          <input className="field" placeholder="العميل" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} aria-label="العميل" />
          <input className="field md:col-span-2" placeholder="المصنع" value={form.factoryName} onChange={(e) => setForm({ ...form, factoryName: e.target.value })} aria-label="المصنع" />
          <textarea className="field md:col-span-2" rows={2} placeholder="ملاحظة" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} aria-label="ملاحظة" />
          <button className="h-11 rounded-xl bg-primary font-bold text-primary-fg md:col-span-2">مشروع جديد</button>
        </form>
        <div className="grid gap-3">
          {projects.map((project) => (
            <article key={project.id} className="rounded-card border border-line bg-surface p-4">
              <h2 className="font-bold">{project.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {project.client} · {project.factoryName || "بدون مصنع"}
              </p>
              {project.note ? <p className="mt-2 text-sm">{project.note}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {stages.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setProjectStage(project.id, stage)}
                    className={
                      "h-10 rounded-xl px-3 text-sm font-bold " +
                      (project.stage === stage ? "bg-primary text-primary-fg" : "border border-line")
                    }
                  >
                    {projectStageLabel(stage)}
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
