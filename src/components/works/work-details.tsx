import type { TWork } from "./works-list";

interface WorkDetailsProps {
  work: TWork;
  showPinHint: boolean;
  showLinkHint: boolean;
}

const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}/${date.getFullYear()}`;
};

export function WorkDetails({ work, showPinHint, showLinkHint }: WorkDetailsProps) {
  return (
    <div className="flex-1 lg:max-w-[45%]">
      <div className="space-y-4">
        <dl className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground font-medium">Role</dt>
            <dd>{work.role}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground font-medium">Year</dt>
            <dd className="tabular-nums">{work.date ? formatDate(work.date) : "N/A"}</dd>
          </div>
          <div className="flex items-center justify-between gap-x-6 text-sm">
            <dt className="text-muted-foreground font-medium">Tech</dt>
            <dd className="text-right">{work.tech.join(", ")}</dd>
          </div>
        </dl>

        <p className="text-justify">{work.overview}</p>

        <p className="text-muted-foreground text-sm">
          {showLinkHint && "Click again to read the case study"}
          {showPinHint && "Click to pin the content"}
        </p>
      </div>
    </div>
  );
}
