import { PhoneApp } from "@/components/PhoneApp";
import { PhoneFrame } from "@/components/PhoneFrame";

export default function Landing() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center overflow-hidden px-4 py-[3vh] sm:px-8">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      {/* hue so the phone and the copy stay readable */}
      <div className="absolute inset-0 -z-10 bg-black/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/45 via-transparent to-black/25" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <PhoneFrame>
          <PhoneApp />
        </PhoneFrame>

        <div className="text-center drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] md:text-left">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="text-[#ecd6a4]">Shore</span>
            <span className="text-sky-300">Check</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-snug font-light text-white/95 sm:text-xl md:mx-0">
            Want to know the perfect beach to go to based on your preferences?
            We got you.
          </p>
        </div>
      </div>
    </main>
  );
}
