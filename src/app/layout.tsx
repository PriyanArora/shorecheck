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
      <body className="flex min-h-full flex-col bg-black text-[#f5f5f7]" suppressHydrationWarning>
        {/* Some antivirus browser extensions stamp bis_skin_checked on every div before React
            hydrates, which trips a hydration warning. Strip it as it appears. */}
        <Script id="strip-extension-attrs" strategy="beforeInteractive">{`
(function(){function bad(n){return n.indexOf('bis_')===0||n.indexOf('__processed_')===0;}
function s(el){if(!el||!el.attributes)return;for(var i=el.attributes.length-1;i>=0;i--){var n=el.attributes[i].name;if(bad(n))el.removeAttribute(n);}}
function all(root){s(root);if(root.querySelectorAll)root.querySelectorAll('*').forEach(s);}
try{all(document.documentElement);
new MutationObserver(function(m){for(var i=0;i<m.length;i++){var r=m[i];if(r.type==='attributes'){if(bad(r.attributeName))r.target.removeAttribute(r.attributeName);}else r.addedNodes.forEach(all);}})
.observe(document.documentElement,{attributes:true,subtree:true,childList:true});}catch(e){}})();
        `}</Script>
        {children}
      </body>
    </html>
  );
}
