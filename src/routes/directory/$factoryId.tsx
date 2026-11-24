import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { OperationsSummary } from "@/components/operations-panel";
import { SiteShell } from "@/components/site-shell";
import { shareFactory, WhatsAppButton } from "@/components/whatsapp-share";
import {
  machineTotal,
  minimumQuantity,
  money,
  quoteForQuantity,
  useFactories,
} from "@/lib/factories";
import { usePlatform } from "@/lib/platform";

export const Route = createFileRoute("/directory/$factoryId")({
  component: PublicFactoryPage,
  head: () => ({ meta: [{ title: "المصنع — صنع في مصر" }] }),
});

function PublicFactoryPage() {
  const { factoryId } = Route.useParams();
  const factory = useFactories((state) => state.factories.find((item) => item.id === factoryId));
  const addOrder = usePlatform((state) => state.addOrder);
  const [productId, setProductId] = useState(factory?.products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(100);
  const [mode, setMode] = useState<"listed" | "offer">("listed");
  const [offerPrice, setOfferPrice] = useState(0);
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const product = useMemo(
    () => factory?.products.find((item) => item.id === productId) ?? factory?.products[0],
    [factory, productId],
  );
  const listed = product ? quoteForQuantity(product.tiers, quantity) : null;
  const unit = mode === "listed" ? listed : offerPrice;
  const total = unit != null && quantity > 0 ? unit * quantity : null;

  if (!factory || factory.status !== "approved") {
    return (
      <SiteShell>
        <div className="rounded-card border border-line bg-surface p-8 text-center">
          <h1 className="text-xl font-bold">المصنع غير متاح للعملاء</h1>
          <p className="mt-2 text-sm text-muted">لازم يكون معتمد وبكود جودة.</p>
          <Link to="/directory" search={{ q: "", section: "" }} className="mt-4 inline-block font-bold text-primary">
            العودة للمصانع
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <img src={factory.cover} alt="" className="h-56 w-full rounded-card object-cover md:h-80" />
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{factory.name}</h1>
          <p className="mt-1 text-sm text-muted">{factory.area}</p>
          <p className="mt-2 text-sm">
            كود الجودة: <span className="font-bold">{factory.qualityCode}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="rounded-xl bg-surface px-4 py-3 text-sm">
            {machineTotal(factory)} ماكينة · {factory.dailyCapacity.toLocaleString("ar-EG")} قطعة/يوم
          </p>
          <WhatsAppButton
            label="شارك المصنع"
            onClick={() => shareFactory(factory)}
          />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7">{factory.address}</p>
      {factory.notes ? <p className="mt-2 text-sm leading-7 text-muted">{factory.notes}</p> : null}
      <OperationsSummary factoryId={factory.id} />

      <section className="mt-6">
        <h2 className="font-bold">المكن</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {factory.machines.map((machine) => (
            <span key={machine.type} className="rounded-full bg-surface px-3 py-2 text-sm font-semibold">
              {machine.type} · {machine.count}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        <h2 className="text-xl font-extrabold">المنتجات والأسعار</h2>
        {factory.products.length === 0 ? (
          <p className="text-sm text-muted">لا توجد منتجات منشورة بعد.</p>
        ) : (
          factory.products.map((item) => (
            <article key={item.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex gap-3">
                <img src={item.image} alt="" className="size-20 rounded-xl object-cover" />
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-muted">
                    {item.category} · {item.fabric}
                  </p>
                </div>
              </div>
              <table className="mt-3 w-full text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="py-1 text-right font-semibold">الكمية</th>
                    <th className="py-1 text-right font-semibold">سعر القطعة</th>
                  </tr>
                </thead>
                <tbody>
                  {item.tiers.map((tier, index) => (
                    <tr key={index} className="border-t border-line">
                      <td className="py-2">
                        {tier.min.toLocaleString("ar-EG")} – {tier.max ? tier.max.toLocaleString("ar-EG") : "فأكثر"}
                      </td>
                      <td className="py-2 font-bold">{money(tier.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))
        )}
      </section>

      {factory.products.length > 0 ? (
        <form
          className="mt-8 grid gap-3 rounded-card border border-line bg-surface p-4 md:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!product || !buyerName.trim() || !phone.trim()) {
              setError("الاسم والتليفون مطلوبان.");
              return;
            }
            if (unit == null || unit <= 0) {
              setError(
                mode === "listed"
                  ? `الحد الأدنى ${minimumQuantity(product.tiers).toLocaleString("ar-EG")} قطعة.`
                  : "اكتب سعر العرض.",
              );
              return;
            }
            addOrder({
              factoryId: factory.id,
              factoryName: factory.name,
              productName: product.name,
              quantity,
              mode,
              unitPrice: unit,
              buyerName: buyerName.trim(),
              phone: phone.trim(),
              note: note.trim(),
            });
            setError("");
            setSent(true);
          }}
        >
          <h2 className="text-lg font-bold">اطلب كمية أو قدّم عرضك</h2>
          <label>
            <span className="mb-1 block text-sm font-bold">المنتج</span>
            <select
              className="field"
              value={product?.id ?? ""}
              onChange={(event) => setProductId(event.target.value)}
            >
              {factory.products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold">الكمية</span>
            <input
              type="number"
              min={1}
              className="field"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value) || 0)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("listed")}
              className={
                "h-11 rounded-xl px-4 text-sm font-bold " +
                (mode === "listed" ? "bg-primary text-primary-fg" : "border border-line")
              }
            >
              استخدم سعر المصنع
            </button>
            <button
              type="button"
              onClick={() => setMode("offer")}
              className={
                "h-11 rounded-xl px-4 text-sm font-bold " +
                (mode === "offer" ? "bg-accent text-accent-fg" : "border border-line")
              }
            >
              قدّم عرض سعر
            </button>
          </div>
          {mode === "offer" ? (
            <label>
              <span className="mb-1 block text-sm font-bold">سعرك للقطعة</span>
              <input
                type="number"
                min={1}
                className="field"
                value={offerPrice || ""}
                onChange={(event) => setOfferPrice(Number(event.target.value) || 0)}
              />
            </label>
          ) : (
            <p className="text-sm">
              {listed != null
                ? `سعر الشريحة ${money(listed)} · الإجمالي ${money(listed * quantity)}`
                : `أقل كمية ${minimumQuantity(product?.tiers ?? []).toLocaleString("ar-EG")} قطعة.`}
            </p>
          )}
          {mode === "offer" && total != null ? (
            <p className="text-sm">الإجمالي حسب عرضك: {money(total)}</p>
          ) : null}
          <label>
            <span className="mb-1 block text-sm font-bold">اسمك</span>
            <input className="field" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold">تليفونك</span>
            <input
              className="field"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold">ملاحظة</span>
            <textarea className="field" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          {error ? <p className="text-sm font-semibold text-bad">{error}</p> : null}
          {sent ? <p className="text-sm font-semibold text-ok">الطلب اتبعت لفريق التشغيل.</p> : null}
          <button type="submit" className="h-12 rounded-xl bg-primary font-bold text-primary-fg">
            إرسال الطلب
          </button>
        </form>
      ) : null}
    </SiteShell>
  );
}
