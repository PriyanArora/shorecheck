import { STATUS, type Status } from "@/lib/data";

const SHAPE: Record<Status, string> = {
  open: "rounded-full",
  advisory:
    "[clip-path:polygon(50%_2%,100%_100%,0_100%)] items-end pb-[8%] leading-none",
  closed:
    "[clip-path:polygon(30%_0,70%_0,100%_30%,100%_70%,70%_100%,30%_100%,0_70%,0_30%)]",
  season: "rounded-[2px]",
};

/** Status as shape + glyph + colour, never colour alone. */
export function StatusMark({
  status,
  size = "size-5",
  text = "text-[11px]",
}: {
  status: Status;
  size?: string;
  text?: string;
}) {
  const s = STATUS[status];
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center font-mono font-bold text-white ${size} ${text} ${s.dot} ${SHAPE[status]}`}
    >
      {s.glyph}
    </span>
  );
}

export function StatusChip({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[11px] font-bold tracking-wide uppercase ${s.chip}`}
    >
      <StatusMark status={status} size="size-3.5" text="text-[9px]" />
      {s.label}
    </span>
  );
}

export function EventMark({ size = "size-5" }: { size?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 rotate-45 items-center justify-center rounded-[3px] border-2 border-white bg-violet-600 ${size}`}
    />
  );
}
