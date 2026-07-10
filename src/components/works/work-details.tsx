import { useEffect, useRef } from "react";
import type { TWork } from "./works-list";

interface WorkDetailsProps {
  work: TWork;
  showPinHint: boolean;
  showLinkHint: boolean;
  children: React.ReactNode;
}

const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}/${date.getFullYear()}`;
};

export function WorkDetails({ work, showPinHint, showLinkHint, children }: WorkDetailsProps) {
  const descriptionsRef = useRef<HTMLDivElement>(null);

  // Descriptions are server-rendered MDX passed through the island's slot;
  // reveal the one matching the selected work.
  useEffect(() => {
    const nodes = descriptionsRef.current?.querySelectorAll<HTMLElement>("[data-work-id]");
    nodes?.forEach((node) => {
      node.hidden = node.dataset.workId !== work.id;
    });
  }, [work.id]);

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
            <dd>{work.date ? formatDate(work.date) : "N/A"}</dd>
          </div>
        </dl>

        <div
          ref={descriptionsRef}
          className="[&_a]:bg-muted [&_a]:text-muted-foreground [&_a]:px-1 [&_a]:font-medium"
        >
          {children}
        </div>

        <p className="text-muted-foreground text-sm">
          {showLinkHint && "Click again to open the link"}
          {showPinHint && "Click to pin the content"}
        </p>
      </div>
    </div>
  );
}
