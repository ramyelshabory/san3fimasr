import { useEffect, useRef, useState } from "react";
import { claimAccount, getMyRole } from "@/lib/account.functions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function useEnsureRole() {
  const { user, isPending } = useCurrentUserState();
  const ran = useRef<string | null>(null);
  useEffect(() => {
    if (isPending || !user || user.isDevFallback) return;
    if (ran.current === user.id) return;
    ran.current = user.id;
    const stored = sessionStorage.getItem("san3-kind");
    sessionStorage.removeItem("san3-kind");
    const kind = stored === "factory" ? "factory" : "auto";
    void claimAccount({ data: { kind } });
  }, [isPending, user]);
}

export function useAdminAccess() {
  const { user, isPending } = useCurrentUserState();
  const [state, setState] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    if (isPending) return;
    if (!user || user.isDevFallback) {
      setState("denied");
      return;
    }
    let cancel = false;
    void (async () => {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const role = await getMyRole();
        if (cancel) return;
        if (role.role === "admin") {
          setState("admin");
          return;
        }
        if (role.role && role.role !== "admin") {
          setState("denied");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (!cancel) setState("denied");
    })();
    return () => {
      cancel = true;
    };
  }, [isPending, user]);

  return state;
}
