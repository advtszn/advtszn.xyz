import { ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

interface WorkItemProps {
  title: string;
  href: string;
  date: Date;
  isActive: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onHover: () => void;
  onLeave: () => void;
}

const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}/${date.getFullYear()}`;
};

export function WorkItem({
  title,
  href,
  date,
  isActive,
  onSelect,
  onHover,
  onLeave,
}: WorkItemProps) {
  return (
    <li
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group relative flex items-center gap-y-2 font-medium"
    >
      <a
        href={href}
        onClick={onSelect}
        className={cn("inline-flex cursor-pointer items-center gap-x-1 px-1 text-left text-lg", {
          "bg-muted text-muted-foreground": isActive,
        })}
      >
        {title}
        <ArrowRight className="size-4" />
      </a>

      <span className="mx-1.5 flex-1 border-t" />

      <p className="text-muted-foreground text-right text-sm tabular-nums">
        {date ? formatDate(date) : "N/A"}
      </p>
    </li>
  );
}
