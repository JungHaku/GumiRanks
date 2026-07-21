import Script from "next/script";
import { SITE } from "@/lib/site";

// GA4 via gtag.js — no-op unless NEXT_PUBLIC_GA_ID is set.
export function Analytics() {
  if (!SITE.gaId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${SITE.gaId}');`}
      </Script>
    </>
  );
}
