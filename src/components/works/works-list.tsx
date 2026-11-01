import type { CollectionEntry } from "astro:content";
import { useMediaQuery } from "usehooks-ts";
import { useWorkSelection } from "./use-work-selection";
import { WorkDetails } from "./work-details";
import { WorkItem } from "./work-item";

export type TWork = CollectionEntry<"works">["data"] & { id: string };

export default function WorksList({ works }: { works: TWork[] }) {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const selection = useWorkSelection<TWork>();

  // Every work has a case study now, so the first click always pins the
  // preview and the second one follows through to it.
  const handleSelect = (e: React.MouseEvent, work: TWork) => {
    const { shouldNavigate } = selection.select(work, true);
    if (!shouldNavigate) e.preventDefault();
  };

  return (
    <div
      ref={selection.containerRef}
      className="flex flex-col space-y-8 lg:flex-row lg:items-start lg:justify-between lg:space-y-0"
    >
      <ul className="flex flex-1 flex-col gap-y-1.5 lg:max-w-[45%]">
        {works.map((work) => (
          <WorkItem
            key={work.id}
            title={work.title}
            href={`/work/${work.id}`}
            date={work.date}
            isActive={selection.isItemActive(work)}
            onSelect={(e) => handleSelect(e, work)}
            onHover={() => selection.hover(work)}
            onLeave={selection.unhover}
          />
        ))}
      </ul>

      {selection.displayedItem && (
        <WorkDetails
          work={selection.displayedItem}
          showPinHint={!isMobile && !selection.isLocked}
          showLinkHint={selection.isLocked}
        />
      )}
    </div>
  );
}
