import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AccountSlot } from "@/components/account-slot";
import { shareSite, WhatsAppButton } from "@/components/whatsapp-share";
import { useAdminAccess, useEnsureRole } from "@/lib/use-role";
import { useFactories } from "@/lib/factories";
import { useOperations } from "@/lib/operations";
import { usePlatform } from "@/lib/platform";

const links = [
  { to: "/", label: "الرئيسية", search: undefined },
  { to: "/directory", label: "المصانع", search: { q: "", section: "" } },
  { to: "/gallery", label: "المعرض", search: undefined },
  { to: "/consult", label: "استشارات", search: undefined },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEnsureRole();
  const access = useAdminAccess();
  useEffect(() => {
    void useFactories.persist.rehydrate();
    void useOperations.persist.rehydrate();
    void usePlatform.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-accent font-extrabold text-accent-fg sm:size-10">
              ص
            </span>
            <span className="font-extrabold">صنع في مصر</span>
          </Link>
          <div className="flex items-center gap-2">
            <WhatsAppButton compact onClick={shareSite} label="شارك الموقع على واتساب" />
            <AccountSlot />
            {access === "admin" ? (
              <Link
                to="/admin"
                className="inline-flex h-9 items-center rounded-xl bg-primary px-3 text-sm font-bold text-primary-fg sm:h-11 sm:px-4"
              >
                لوحة التحكم
              </Link>
            ) : null}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-2 sm:pb-3">
          {links.map((link) => {
            const active = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                search={link.search}
                className={
                  "inline-flex h-9 shrink-0 items-center rounded-full px-3 text-sm font-bold sm:h-11 sm:px-4 " +
                  (active ? "bg-primary text-primary-fg" : "border border-line bg-bg")
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-16">{children}</main>
      <footer className="border-t border-line px-4 py-8 text-center text-sm text-muted">
        صنع في مصر · مجاني السنة الأولى للمصانع والعملاء، وبعدها اشتراك.
      </footer>
    </div>
  );
}
