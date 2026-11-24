import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "صنع في مصر" },
      {
        name: "description",
        content:
          "منصة صنع في مصر بتربط أصحاب رأس المال بمصانع وورش مصرية مصنّفة حسب قسم التصنيع — ملابس، أثاث، أغذية، بلاستيك، معادن، وتغليف. شوف القدرة اليومية والسعر، أو ابعث عرضك للمصنع.",
      },
      { name: "theme-color", content: "#102033" },
      { property: "og:site_name", content: "صنع في مصر" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_EG" },
      { property: "og:title", content: "صنع في مصر" },
      {
        property: "og:description",
        content:
          "منصة بتربط أصحاب رأس المال بمصانع وورش مصرية مصنّفة حسب قسم التصنيع. شوف القدرة اليومية والسعر، أو ابعث عرضك للمصنع.",
      },
      { property: "og:image", content: "https://www.san3fimasr.com/media/workshop-1.jpg" },
      { property: "og:url", content: "https://www.san3fimasr.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "صنع في مصر" },
      {
        name: "twitter:description",
        content: "منصة بتربط أصحاب رأس المال بمصانع وورش مصرية مصنّفة حسب قسم التصنيع.",
      },
      { name: "twitter:image", content: "https://www.san3fimasr.com/media/workshop-1.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
