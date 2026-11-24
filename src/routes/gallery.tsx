import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({ meta: [{ title: "المعرض — صنع في مصر" }] }),
});

const shots = [
  {
    src: "/media/workshop-1.jpg",
    title: "ورشة بيجام",
    caption: "خط تيشيرت وهودي بعد زيارة فريق شبرا الخيمة.",
  },
  {
    src: "/media/workshop-2.jpg",
    title: "ورشة باسوس",
    caption: "مقاسات أطفال، قص وخياطة في نفس الدور.",
  },
  {
    src: "/media/machines.jpg",
    title: "المكن",
    caption: "أوفر وأوفرلوك وتطريز. العدد بيتسجل في ملف المصنع.",
  },
  {
    src: "/media/tee.jpg",
    title: "تيشيرت قطن",
    caption: "سعر الشريحة بينزل لما الكمية تزيد.",
  },
  {
    src: "/media/hoodie.jpg",
    title: "هودي ثقيل",
    caption: "عينة لتطوير منتج لأصحاب رؤوس الأموال.",
  },
];

function GalleryPage() {
  return (
    <SiteShell>
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold">المعرض</h1>
        <p className="mt-2 text-sm text-muted">صور الورش والمنتجات اللي الفريق جمعها من الأرض.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {shots.map((shot) => (
          <figure key={shot.title} className="overflow-hidden rounded-card border border-line bg-surface">
            <img src={shot.src} alt={shot.title} className="h-56 w-full object-cover md:h-72" />
            <figcaption className="p-4">
              <p className="font-bold">{shot.title}</p>
              <p className="mt-1 text-sm text-muted">{shot.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </SiteShell>
  );
}
