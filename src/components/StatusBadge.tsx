import { Badge } from "@/components/ui/badge";
import { STATUS, type Status } from "@/lib/data";
import { cn } from "@/lib/utils";

const DOT: Record<Status, string> = {
  open: "bg-emerald-400",
  advisory: "bg-amber-400",
  closed: "bg-red-400",
  season: "bg-neutral-500",
};

/** Status as a neutral outline badge with a coloured dot and a word, never colour alone. */
export function StatusBadge({
  status,
  className,
  short = false,
}: {
  status: Status;
  className?: string;
  short?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border-white/15 text-[#f5f5f7]", className)}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT[status])} />
      {short && status === "season" ? "Season over" : STATUS[status].label}
    </Badge>
  );
}
