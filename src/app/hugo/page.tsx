import { Nav } from "@/components/Nav";
import { HugoChat } from "@/components/HugoChat";

export default function HugoPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-28 pb-10">
        <p className="text-[19px] font-semibold text-[#86868b]">
          Hugo
        </p>
        <h1 className="mt-2 text-[40px] leading-[1.1] font-semibold tracking-[-0.003em] text-[#f5f5f7]">
          Ask for a beach.
        </h1>
        <p className="mt-2 text-[17px] leading-[1.47] text-[#86868b]">
          Answers come from the same tested data as the map.
        </p>
        <div className="mt-6 flex h-[min(70vh,720px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111]">
          <HugoChat />
        </div>
      </main>
    </>
  );
}
