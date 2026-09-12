import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../../fonts/PPNeueGstaad-Light.otf", weight: "300", style: "normal" },
    { path: "../../fonts/PPNeueGstaad-Regular.otf", weight: "400", style: "normal" },
    { path: "../../fonts/PPNeueGstaad-Bold.otf", weight: "700", style: "normal" },
  ],
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
    "Official water quality status for Halifax's supervised beaches, events nearby, and Hugo, who picks the beach for you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
