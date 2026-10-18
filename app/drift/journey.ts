import { CHAPTERS } from "./chapters";

export const JOURNEY_GROUPS = [
  { name: "Home", caption: "Where it begins", ids: ["hyderabad"] },
  {
    name: "Europe",
    caption: "The first solo arc",
    ids: ["europe", "amsterdam", "berlin", "prague", "spain"],
  },
  {
    name: "Asia & Pacific",
    caption: "A little closer to myself",
    ids: ["southeast-asia", "bali-gili-t", "bohol", "australia"],
  },
  {
    name: "The mountains",
    caption: "Above it all",
    ids: ["himalayas", "uttarakhand"],
  },
];
const LOCATION_CHAPTERS: Record<string, string> = {
  Hyderabad: "hyderabad",
  Amsterdam: "amsterdam",
  Berlin: "berlin",
  Prague: "prague",
  Mallorca: "spain",
  Barcelona: "spain",
  Bali: "bali-gili-t",
  "Gili T": "bali-gili-t",
  Bohol: "bohol",
  Noosa: "australia",
  Sydney: "australia",
  Kasol: "himalayas",
  Manali: "himalayas",
  "Brighu Lake": "himalayas",
  Chandrashila: "uttarakhand",
};
export function locationChapterIndex(name: string) {
  return CHAPTERS.findIndex(
    (chapter) => chapter.id === LOCATION_CHAPTERS[name],
  );
}
export function journeyGroup(id: string) {
  return (
    JOURNEY_GROUPS.find((group) => group.ids.includes(id)) ?? JOURNEY_GROUPS[0]
  );
}
export function formatCoordinates([lng, lat]: [number, number]) {
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"} · ${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? "E" : "W"}`;
}
