import { Link } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";
import { accountLabel } from "@/lib/account-id";
import { signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const subscribe = () => () => {};

export function AccountSlot() {
  const { user, isPending } = useCurrentUserState();
  const [busy, setBusy] = useState(false);
  const gate = useSyncExternalStore(subscribe, hasGateSessionMarker, () => false);
  if (isPending) {
    return <span className="inline-block h-11 w-24 animate-pulse rounded-xl bg-line" aria-hidden />;
  }
  if (!user || user.isDevFallback) {
    return (
      <Link
        to="/login"
        className="inline-flex h-11 items-center rounded-xl border border-line bg-surface px-4 text-sm font-bold"
      >
        تسجيل
      </Link>
    );
  }
  const label = accountLabel(user.primaryEmail, user.displayName);
  return (
    <div className="flex items-center gap-2">
      <Link to="/profile" className="max-w-28 truncate text-sm font-bold">
        {label}
      </Link>
      {gate ? null : (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void signOut("/").catch(() => setBusy(false));
          }}
          className="inline-flex h-11 items-center rounded-xl border border-line px-3 text-sm font-bold"
        >
          {busy ? "..." : "خروج"}
        </button>
      )}
    </div>
  );
}