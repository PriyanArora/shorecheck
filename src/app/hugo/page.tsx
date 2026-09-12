import { Nav } from "@/components/Nav";
import { HugoChat } from "@/components/HugoChat";

export default function HugoPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-28 pb-10">
        <p className="text-[13px] font-semibold tracking-[0.18em] text-white/50 uppercase">
          Hugo
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-white">
          Ask for a beach.
        </h1>
        <p className="mt-2 text-[15px] font-light text-white/60">
          Answers come from the same tested data as the map.
        </p>
        <div className="mt-6 flex h-[min(70vh,720px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111]">
          <HugoChat />
        </div>
      </main>
    </>
  );
}
