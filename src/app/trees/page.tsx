import { Nav } from "@/components/Nav";

const TREE_URL = "https://halifax-tree-screening.fly.dev/";

export const metadata = {
  title: "Which Tree Falls First — ShoreCheck",
};

export default function TreesPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-28 pb-24">
        <header className="max-w-2xl">
          <p className="text-[19px] font-semibold text-[#86868b]">Trees</p>
          <h1 className="mt-2 text-[44px] leading-[1.08] font-semibold tracking-[-0.003em] text-[#f5f5f7] sm:text-[56px]">
            Which tree falls first.
          </h1>
          <p className="mt-4 text-[21px] leading-[1.19] tracking-[0.011em] text-[#86868b]">
            Ranks HRM&apos;s tree-hazard queue so crews go to the branch that will actually hit
            a house. Draw an area, screen the public-tree inventory, and pick a lead. A
            teammate&apos;s project, running live inside ShoreCheck.
          </p>
        </header>

        <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]">
          <iframe
            src={TREE_URL}
            title="Halifax Tree Screening"
            allow="geolocation; fullscreen"
            className="block h-[calc(100dvh-7rem)] min-h-[560px] w-full bg-[#0a0a0a] [filter:grayscale(1)_invert(0.93)_hue-rotate(180deg)_contrast(1.02)_brightness(0.95)] sm:h-[80vh]"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="mt-3 text-[12px] text-[#6e6e73]">
          Shown in ShoreCheck&apos;s black and grey. The tool is served from the team&apos;s own
          app; on a phone, draw the area inside the frame.
        </p>
      </main>
    </>
  );
}
