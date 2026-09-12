import { Nav } from "@/components/Nav";
import { HugoChat } from "@/components/HugoChat";

export default function HugoPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-6">
        <HugoChat />
      </main>
    </>
  );
}
