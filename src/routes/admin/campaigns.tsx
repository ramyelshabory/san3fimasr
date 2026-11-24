import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/shell";
import { Gate } from "@/components/gate";
import { campaignStatusLabel, usePlatform, type CampaignStatus } from "@/lib/platform";

export const Route = createFileRoute("/admin/campaigns")({ component: CampaignsPage });

const statuses: CampaignStatus[] = ["planned", "running", "done"];

function CampaignsPage() {
  const campaigns = usePlatform((state) => state.campaigns);
  const addCampaign = usePlatform((state) => state.addCampaign);
  const setCampaignStatus = usePlatform((state) => state.setCampaignStatus);
  const [name, setName] = useState("");
  const [area, setArea] = useState("شبرا الخيمة");
  const [budget, setBudget] = useState(20000);
  const [note, setNote] = useState("");

  return (
    <DashboardShell>
      <Gate moduleId="campaigns">
        <h1 className="mb-2 text-3xl font-extrabold">الحملات</h1>
        <p className="mb-6 text-sm text-muted">حملات التعريف في المناطق البعيدة عن المنطقة الصناعية.</p>
        <form
          className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            addCampaign({ name: name.trim(), area, budget, note });
            setName("");
            setNote("");
          }}
        >
          <input className="field" placeholder="اسم الحملة" value={name} onChange={(e) => setName(e.target.value)} aria-label="اسم الحملة" />
          <input className="field" placeholder="المنطقة" value={area} onChange={(e) => setArea(e.target.value)} aria-label="المنطقة" />
          <input className="field" type="number" min={0} value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} aria-label="الميزانية" />
          <textarea className="field" rows={2} placeholder="ملاحظة" value={note} onChange={(e) => setNote(e.target.value)} aria-label="ملاحظة" />
          <button className="h-11 rounded-xl bg-primary font-bold text-primary-fg">حملة جديدة</button>
        </form>
        <div className="grid gap-3">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-card border border-line bg-surface p-4">
              <h2 className="font-bold">{campaign.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {campaign.area} · ميزانية {campaign.budget.toLocaleString("ar-EG")} ج
              </p>
              {campaign.note ? <p className="mt-2 text-sm">{campaign.note}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setCampaignStatus(campaign.id, status)}
                    className={
                      "h-10 rounded-xl px-3 text-sm font-bold " +
                      (campaign.status === status ? "bg-accent text-accent-fg" : "border border-line")
                    }
                  >
                    {campaignStatusLabel(status)}
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
