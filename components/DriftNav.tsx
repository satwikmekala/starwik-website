"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Chapter } from "@/app/drift/chapters";
import { JOURNEY_GROUPS } from "@/app/drift/journey";
import DriftIcon from "./DriftIcon";
import styles from "@/app/drift/drift.module.css";

interface DriftNavProps {
  chapters: Chapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
  pickerOpen: boolean;
  onPickerChange: (open: boolean) => void;
  panelOpen: boolean;
  onStoryToggle: () => void;
  storyButtonRef: RefObject<HTMLButtonElement | null>;
  isFlying: boolean;
}

export default function DriftNav({
  chapters,
  activeIndex,
  onSelect,
  pickerOpen,
  onPickerChange,
  panelOpen,
  onStoryToggle,
  storyButtonRef,
  isFlying,
}: DriftNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matchingChapters = chapters.filter((chapter) => {
    const group = JOURNEY_GROUPS.find((group) =>
      group.ids.includes(chapter.id),
    );
    const text = [chapter.title, chapter.subtitle, ...chapter.tags, group?.name]
      .join(" ")
      .toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });

  useEffect(() => {
    if (!pickerOpen) return;
    const picker = pickerRef.current;
    const trigger = triggerRef.current;
    picker?.querySelector<HTMLButtonElement>('[aria-current="step"]')?.focus();
    const outside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node))
        onPickerChange(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      if (
        picker?.contains(document.activeElement) ||
        document.activeElement === document.body
      )
        trigger?.focus();
    };
  }, [pickerOpen, onPickerChange]);

  return (
    <nav
      ref={navRef}
      className={styles.navigation}
      aria-label="Journey chapters"
      data-drift-ui
    >
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            ref={pickerRef}
            id="drift-chapters"
            role="dialog"
            aria-label="Choose a chapter"
            className={`${styles.chapterPicker} ${styles.glass}`}
            initial={{
              opacity: 0,
              y: reducedMotion ? 0 : 12,
              scale: reducedMotion ? 1 : 0.97,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: reducedMotion ? 0 : 8,
              scale: reducedMotion ? 1 : 0.98,
            }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                onPickerChange(false);
                triggerRef.current?.focus();
                return;
              }
              if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
                return;
              const fromSearch =
                (event.target as HTMLElement).tagName === "INPUT";
              if (fromSearch && ["Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const buttons = Array.from(
                pickerRef.current?.querySelectorAll<HTMLButtonElement>(
                  "[data-chapter]",
                ) ?? [],
              );
              const current = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End" ||
                      (fromSearch && event.key === "ArrowUp")
                    ? buttons.length - 1
                    : (current +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        buttons.length) %
                      buttons.length;
              buttons[next]?.focus();
            }}
          >
            <div className={styles.pickerHeader}>
              <div>
                <span className={styles.eyebrow}>The atlas</span>
                <h2>Pick a place.</h2>
              </div>
              <button
                className={styles.iconButton}
                aria-label="Close chapter picker"
                onClick={() => {
                  onPickerChange(false);
                  triggerRef.current?.focus();
                }}
              >
                <DriftIcon name="close" width="17" height="17" />
              </button>
            </div>
            <div className={styles.pickerSearch}>
              <DriftIcon name="search" width="17" height="17" />
              <input
                type="search"
                aria-label="Search places"
                placeholder="Search places, countries…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && matchingChapters.length === 1) {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelect(chapters.indexOf(matchingChapters[0]));
                    triggerRef.current?.focus();
                  }
                }}
              />
              {query && (
                <button
                  className={styles.iconButton}
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    pickerRef.current
                      ?.querySelector<HTMLInputElement>("input")
                      ?.focus();
                  }}
                >
                  <DriftIcon name="close" width="15" height="15" />
                </button>
              )}
            </div>
            <div className={styles.pickerScroll}>
              {matchingChapters.length === 0 && (
                <p className={styles.searchEmpty} role="status">
                  No places found.<span>Try a city, country, or journey.</span>
                </p>
              )}
              {JOURNEY_GROUPS.filter((group) =>
                matchingChapters.some((chapter) =>
                  group.ids.includes(chapter.id),
                ),
              ).map((group) => (
                <section
                  key={group.name}
                  className={styles.pickerGroup}
                  aria-label={group.name}
                >
                  <h3>
                    {group.name}
                    <span>{group.caption}</span>
                  </h3>
                  {group.ids
                    .filter((id) =>
                      matchingChapters.some((chapter) => chapter.id === id),
                    )
                    .map((id) => {
                      const index = chapters.findIndex(
                        (chapter) => chapter.id === id,
                      );
                      const chapter = chapters[index];
                      return (
                        <button
                          key={id}
                          data-chapter
                          className={`${styles.chapterOption} ${index === activeIndex ? styles.chapterSelected : ""}`}
                          aria-current={
                            index === activeIndex ? "step" : undefined
                          }
                          onClick={() => {
                            onSelect(index);
                            triggerRef.current?.focus();
                          }}
                        >
                          <span className={styles.chapterNumber}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>
                            {chapter.title}
                            {chapter.isOverview && <small>Overview</small>}
                          </span>
                          {index === activeIndex ? (
                            <DriftIcon name="check" width="17" height="17" />
                          ) : (
                            <span className={styles.optionDot} />
                          )}
                        </button>
                      );
                    })}
                </section>
              ))}
            </div>
            <div className={styles.pickerFooter}>
              <span role="status">
                {query.trim()
                  ? matchingChapters.length +
                    " matching " +
                    (matchingChapters.length === 1 ? "chapter" : "chapters")
                  : chapters.length + " chapters, and still counting."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.navigationRow}>
        <div className={`${styles.chapterBar} ${styles.glass}`}>
          <button
            className={styles.navArrow}
            aria-label="Previous chapter"
            disabled={activeIndex === 0}
            onClick={() => onSelect(activeIndex - 1)}
          >
            <DriftIcon name="back" />
          </button>
          <button
            ref={triggerRef}
            className={styles.chapterTrigger}
            aria-label={`Choose chapter, current ${chapters[activeIndex].title}`}
            aria-expanded={pickerOpen}
            aria-controls="drift-chapters"
            aria-haspopup="dialog"
            onClick={() => {
              if (!pickerOpen) setQuery("");
              onPickerChange(!pickerOpen);
            }}
          >
            <span className={styles.navChapterText}>
              {chapters[activeIndex].title}
              <span className={styles.navCounter}>
                <span
                  className={`${styles.travelDot} ${isFlying ? styles.travelDotMoving : ""}`}
                />
                {String(activeIndex + 1).padStart(2, "0")}
                <span> / {String(chapters.length).padStart(2, "0")}</span>
              </span>
            </span>
            <DriftIcon
              name="chevron"
              width="16"
              height="16"
              className={pickerOpen ? styles.rotated : ""}
            />
          </button>
          <button
            className={styles.navArrow}
            aria-label="Next chapter"
            disabled={activeIndex === chapters.length - 1}
            onClick={() => onSelect(activeIndex + 1)}
          >
            <DriftIcon name="next" />
          </button>
        </div>
        <button
          ref={storyButtonRef}
          className={`${styles.storyToggle} ${styles.glass} ${panelOpen ? styles.storyToggleActive : ""}`}
          aria-label={panelOpen ? "Hide story" : "Show story"}
          aria-expanded={panelOpen}
          aria-controls="drift-story"
          onClick={onStoryToggle}
        >
          <DriftIcon name="story" />
        </button>
      </div>
    </nav>
  );
}
