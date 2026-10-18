import type { SVGProps } from "react";

export type DriftIconName =
  | "back"
  | "next"
  | "close"
  | "chevron"
  | "map"
  | "story"
  | "locate"
  | "check"
  | "globe"
  | "search"
  | "link"
  | "plus"
  | "minus"
  | "arrow";
const paths: Record<DriftIconName, string> = {
  back: "m14 6-6 6 6 6",
  next: "m10 6 6 6-6 6",
  close: "m6 6 12 12M18 6 6 18",
  chevron: "m7 10 5 5 5-5",
  map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15M15 6v15",
  story: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  locate:
    "M12 3v3M12 18v3M3 12h3M18 12h3M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM12 10v4M10 12h4",
  check: "m5 12 4 4L19 6",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-1.5 4.5L21 21",
  link: "m10 13 4-4M8 15l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0",
  plus: "M5 12h14M12 5v14",
  minus: "M5 12h14",
};
export default function DriftIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: DriftIconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
