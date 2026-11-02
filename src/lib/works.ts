import { getCollection } from "astro:content";

const byNewest = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime();

// One gallery, but the deep case studies come first. Inside each group it's
// newest first, so a new entry places itself and the only decision per entry
// is whether it's featured.
const getGroupedWorks = async () => {
  const works = await getCollection("works");
  return {
    featured: works.filter((work) => work.data.featured).sort(byNewest),
    smaller: works.filter((work) => !work.data.featured).sort(byNewest),
  };
};

// Featured first, then everything else, so both the works list and the "more
// works" rail reach for a case study before a one-weekend build.
export const getSortedWorks = async () => {
  const { featured, smaller } = await getGroupedWorks();
  return [...featured, ...smaller];
};
