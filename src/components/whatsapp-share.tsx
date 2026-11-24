import { previewPathPrefix } from "@/lib/preview-path-prefix";

function pageUrl(path: string) {
  if (typeof window === "undefined") return path;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
  return `${window.location.origin}${prefix}${path}`;
}

export function openWhatsApp(text: string) {
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

export function shareSite() {
  openWhatsApp(`صنع في مصر\nمصانع مصر مصنّفة حسب قسم التصنيع.\n${pageUrl("/")}`);
}

export function shareFactory(factory: { id: string; name: string; area: string; qualityCode: string }) {
  const lines = [
    factory.name,
    factory.area,
    factory.qualityCode ? `كود الجودة: ${factory.qualityCode}` : "",
    pageUrl(`/directory/${factory.id}`),
  ].filter(Boolean);
  openWhatsApp(lines.join("\n"));
}

export function WhatsAppButton({
  label,
  onClick,
  compact = false,
}: {
  label?: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      aria-label={label ?? "مشاركة على واتساب"}
      title={label ?? "مشاركة على واتساب"}
      className={
        "inline-flex items-center justify-center gap-1 bg-white font-bold text-black shadow-sm " +
        (compact ? "size-[22px] rounded-full" : "h-[22px] rounded-lg border border-line px-2 text-xs")
      }
    >
      <WhatsAppIcon />
      {label && !compact ? <span>{label}</span> : null}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-2.5 fill-current">
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5Zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}
