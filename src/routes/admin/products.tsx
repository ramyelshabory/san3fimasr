import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { usePlatform } from "@/lib/platform";

export const Route = createFileRoute("/admin/products")({ component: ProductsPage });

function ProductsPage() {
  const ideas = usePlatform((state) => state.ideas);
  const addIdea = usePlatform((state) => state.addIdea);
  const [form, setForm] = useState({ title: "", audience: "", margin: "", note: "" });

  return (
    <DashboardShell>
      <Gate moduleId="products">
        <h1 className="mb-2 text-3xl font-extrabold">تطوير المنتجات</h1>
        <p className="mb-6 text-sm text-muted">
          اختيار القطعة، الجمهور، وتكلفة التصنيع عند الغير قبل ما المستثمر يطلب كمية.
        </p>
        <form
          className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.title.trim()) return;
            addIdea(form);
            setForm({ title: "", audience: "", margin: "", note: "" });
          }}
        >
          <input className="field" placeholder="المنتج" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} aria-label="المنتج" />
          <input className="field" placeholder="الجمهور" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} aria-label="الجمهور" />
          <input className="field" placeholder="التكلفة والهامش" value={form.margin} onChange={(e) => setForm({ ...form, margin: e.target.value })} aria-label="الهامش" />
          <textarea className="field" rows={2} placeholder="خطة التسويق المختصرة" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} aria-label="الخطة" />
          <button className="h-11 rounded-xl bg-primary font-bold text-primary-fg">إضافة فكرة</button>
        </form>
        <div className="grid gap-3">
          {ideas.map((idea) => (
            <article key={idea.id} className="rounded-card border border-line bg-surface p-4">
              <h2 className="font-bold">{idea.title}</h2>
              <p className="mt-1 text-sm text-muted">{idea.audience}</p>
              <p className="mt-2 text-sm">{idea.margin}</p>
              {idea.note ? <p className="mt-2 text-sm leading-6 text-muted">{idea.note}</p> : null}
            </article>
          ))}
        </div>
      </Gate>
    </DashboardShell>
  );
}
