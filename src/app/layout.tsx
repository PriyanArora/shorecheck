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
    "Official water quality for Halifax's supervised beaches, a rain-driven prediction you can check against the tests, a satellite watch on 43 lakes, and Hugo to pick a beach for you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black text-[#f5f5f7]">
        {children}
      </body>
    </html>
  );
}
