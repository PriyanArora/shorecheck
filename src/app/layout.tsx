import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-local",
  display: "swap",
});

const mono = localFont({
  src: [
    { path: "../../fonts/PPFraktionMono-Light.Dj9vbPVv.ttf", weight: "300", style: "normal" },
    { path: "../../fonts/PPFraktionMono-Regular.otf", weight: "400", style: "normal" },
    { path: "../../fonts/PPFraktionMono-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "../../fonts/PPFraktionMono-Bold.otf", weight: "700", style: "normal" },
    { path: "../../fonts/PPFraktionMono-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-mono-local",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShoreCheck — Halifax beach water quality",
  description:
    "Official water quality for Halifax's supervised beaches, a rain-driven prediction you can check against the tests, a satellite watch on 43 lakes, and Hugo to pick a beach for you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black text-[#f5f5f7]">
        {/* Some antivirus browser extensions stamp bis_skin_checked on every div before React
            hydrates, which trips a hydration warning. Strip it as it appears. */}
        <Script id="strip-extension-attrs" strategy="beforeInteractive">{`
(function(){var A='bis_skin_checked';function s(n){if(n.removeAttribute)n.removeAttribute(A);}
try{document.querySelectorAll('['+A+']').forEach(s);
new MutationObserver(function(m){for(var i=0;i<m.length;i++){var r=m[i];if(r.type==='attributes')s(r.target);else r.addedNodes.forEach(function(n){if(n.querySelectorAll){s(n);n.querySelectorAll('['+A+']').forEach(s);}});}})
.observe(document.documentElement,{attributes:true,subtree:true,childList:true,attributeFilter:[A]});}catch(e){}})();
        `}</Script>
        {children}
      </body>
    </html>
  );
}
