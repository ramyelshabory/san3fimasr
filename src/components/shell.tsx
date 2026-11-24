import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Factory,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  MapPinned,
  Megaphone,
  Menu,
  MessagesSquare,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AccountSlot } from "@/components/account-slot";
import { SiteShell } from "@/components/site-shell";
import { factoryMatches, useFactories, useFactorySearch } from "@/lib/factories";
import { useOperations } from "@/lib/operations";
import { canAccess, MODULES, usePlatform, type ModuleId } from "@/lib/platform";
import { useAdminAccess } from "@/lib/use-role";

const icons: Record<ModuleId, typeof Factory> = {
  overview: LayoutDashboard,
  factories: Factory,
  orders: ShoppingBag,
  employees: Users,
  campaigns: Megaphone,
  field: MapPinned,
  accounts: Wallet,
  quality: ShieldCheck,
  products: Lightbulb,
  projects: FolderKanban,
  consultations: MessagesSquare,
  departments: Building2,
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const employees = usePlatform((state) => state.employees);
  const activeEmployeeId = usePlatform((state) => state.activeEmployeeId);
  const setActiveEmployee = usePlatform((state) => state.setActiveEmployee);
  const access = useAdminAccess();

  useEffect(() => {
    void useFactories.persist.rehydrate();
    void useOperations.persist.rehydrate();
    void usePlatform.persist.rehydrate();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (access === "loading") {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">بنراجع صلاحية الأدمن...</div>;
  }
  if (access !== "admin") {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-extrabold">لوحة التحكم لصاحب المنصة</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            أول حساب يتسجل بإيميل حقيقي هو أدمن التطبيق. سجّل بالإيميل، وبعدها تقدر تضيف أقسام تصنيع ومصانع.
          </p>
          <Link to="/login" className="mt-5 inline-flex h-12 items-center rounded-xl bg-primary px-5 font-bold text-primary-fg">
            تسجيل الدخول
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-sidebar text-sidebar-fg md:flex">
          <Brand />
          <Nav pathname={pathname} activeEmployeeId={activeEmployeeId} employees={employees} />
          <RoleSelect
            employees={employees}
            activeEmployeeId={activeEmployeeId}
            onChange={setActiveEmployee}
          />
          <div className="px-4 pb-5">
            <AccountSlot />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-xl border border-line"
              onClick={() => setOpen(true)}
              aria-label="فتح القائمة"
            >
              <Menu className="size-5" />
            </button>
            <span className="font-bold">صنع في مصر</span>
            <AccountSlot />
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 md:px-8 md:py-6">
            <FactorySearch />
            {children}
          </main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="إغلاق"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-72 flex-col bg-sidebar text-sidebar-fg shadow-xl">
            <div className="flex items-center justify-between px-4 pt-4">
              <Brand />
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl text-sidebar-fg"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
              >
                <X className="size-5" />
              </button>
            </div>
            <Nav pathname={pathname} activeEmployeeId={activeEmployeeId} employees={employees} />
            <RoleSelect
              employees={employees}
              activeEmployeeId={activeEmployeeId}
              onChange={setActiveEmployee}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function RoleSelect({
  employees,
  activeEmployeeId,
  onChange,
}: {
  employees: { id: string; name: string; role: string }[];
  activeEmployeeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="px-4 pb-5">
      <span className="mb-1 block text-xs text-sidebar-muted">تعمل بصلاحية</span>
      <select
        value={activeEmployeeId}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-white/15 bg-white/10 px-2 text-sm text-sidebar-fg"
      >
        <option value="owner">مدير المنصة</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.name} — {employee.role}
          </option>
        ))}
      </select>
    </label>
  );
}

function FactorySearch() {
  const factories = useFactories((state) => state.factories);
  const query = useFactorySearch((state) => state.q);
  const setQuery = useFactorySearch((state) => state.setQ);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const onList = pathname === "/factories" || pathname === "/factories/";

  const matches = useMemo(
    () => factories.filter((factory) => factoryMatches(factory, query)).slice(0, 6),
    [factories, query],
  );

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  return (
    <div ref={box} className="relative mb-5">
      <Search className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted" />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setOpen(false);
            void navigate({ to: "/factories" });
          }
        }}
        placeholder="ابحث في المصانع من أي صفحة..."
        className="field pr-12"
        aria-label="بحث في المصانع"
      />
      {open && query.trim() && !onList ? (
        <div className="absolute inset-x-0 top-14 z-20 overflow-hidden rounded-card border border-line bg-surface">
          {matches.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted">لا توجد مصانع مطابقة.</p>
          ) : (
            <ul>
              {matches.map((factory) => (
                <li key={factory.id}>
                  <Link
                    to="/factories/$factoryId"
                    params={{ factoryId: factory.id }}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-bg"
                  >
                    <span className="font-bold">{factory.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{factory.area}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/factories"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-3 text-sm font-bold text-primary"
          >
            عرض كل النتائج
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 py-6">
      <span className="grid size-10 place-items-center rounded-xl bg-accent font-extrabold text-accent-fg">
        ص
      </span>
      <div>
        <p className="text-base font-extrabold leading-none">صنع في مصر</p>
        <p className="mt-1 text-xs text-sidebar-muted">لوحة التحكم</p>
      </div>
    </div>
  );
}

function Nav({
  pathname,
  activeEmployeeId,
  employees,
}: {
  pathname: string;
  activeEmployeeId: string;
  employees: { id: string; permissions: ModuleId[] }[];
}) {
  const visible = MODULES.filter((item) => canAccess(employees, activeEmployeeId, item.id));
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
      {visible.map((link) => {
        const active =
          link.to === "/admin"
            ? pathname === "/admin" || pathname === "/admin/"
            : pathname.startsWith(link.to);
        const Icon = icons[link.id];
        return (
          <Link
            key={link.to}
            to={link.to}
            className={
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold " +
              (active ? "bg-primary text-primary-fg" : "text-sidebar-fg hover:bg-white/10")
            }
          >
            <Icon className="size-5 shrink-0" />
            {link.label}
          </Link>
        );
      })}
      <Link to="/" className="mt-2 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-muted">
        العودة للموقع
      </Link>
    </nav>
  );
}
