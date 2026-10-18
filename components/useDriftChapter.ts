"use client";

import { useSyncExternalStore } from "react";
import { CHAPTERS } from "@/app/drift/chapters";

const CHANGE_EVENT = "drift-chapter-change";
function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  window.addEventListener("popstate", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("hashchange", listener);
    window.removeEventListener("popstate", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}
function getChapterIndex() {
  const index = CHAPTERS.findIndex(
    (chapter) => "#" + chapter.id === window.location.hash,
  );
  return Math.max(0, index);
}
const getServerChapterIndex = () => 0;

export function navigateToChapter(index: number) {
  const hash = "#" + CHAPTERS[index].id;
  if (window.location.hash === hash) return;
  window.history.pushState(null, "", hash);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export default function useDriftChapter() {
  return useSyncExternalStore(
    subscribe,
    getChapterIndex,
    getServerChapterIndex,
  );
}
