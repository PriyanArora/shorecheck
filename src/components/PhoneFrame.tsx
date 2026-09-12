import Image from "next/image";

/** iPhone shell. Children render inside the glass, under the dynamic island. */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[860/1780] h-[min(90vh,980px)] max-w-full drop-shadow-2xl">
      <Image
        src="/iphone.png"
        alt=""
        fill
        priority
        sizes="420px"
        className="pointer-events-none select-none"
      />

      <div
        // --island: vertical room the dynamic island needs, in the frame's own scale
        style={{ "--island": "min(5.4vh,58px)" } as React.CSSProperties}
        className="absolute top-[2%] right-[4.5%] bottom-[2.1%] left-[4.5%] z-10 overflow-hidden rounded-[min(6.1vh,66px)] bg-stone-50"
      >
        <div className="h-full">{children}</div>

        {/* dynamic island, matched to the frame */}
        <div className="absolute top-[1.6%] left-[34.3%] z-1600 flex h-[4.1%] w-[31.4%] items-center justify-end rounded-full bg-black pr-[4%]">
          <span className="aspect-square h-[58%] rounded-full bg-slate-900 ring-1 ring-slate-700" />
        </div>
      </div>
    </div>
  );
}
