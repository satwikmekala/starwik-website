"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CHAPTERS, type Chapter } from "@/app/drift/chapters";
import { formatCoordinates, journeyGroup } from "@/app/drift/journey";
import DriftIcon from "./DriftIcon";
import styles from "@/app/drift/drift.module.css";

interface DriftPanelProps {
  chapter: Chapter;
  index: number;
  total: number;
  direction: number;
  open: boolean;
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export default function DriftPanel({
  chapter,
  index,
  total,
  direction,
  open,
  expanded,
  onExpand,
  onClose,
  onSelect,
}: DriftPanelProps) {
  const reducedMotion = useReducedMotion();
  const touchStart = useRef<number | null>(null);
  const group = journeyGroup(chapter.id);
  const [linkStatus, setLinkStatus] = useState<{
    id: string;
    status: "copied" | "error";
  } | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  const copyChapterLink = async () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    try {
      const url = new URL(window.location.href);
      url.hash = chapter.id;
      await navigator.clipboard.writeText(url.href);
      setLinkStatus({ id: chapter.id, status: "copied" });
    } catch {
      setLinkStatus({ id: chapter.id, status: "error" });
    }
    copyTimer.current = setTimeout(() => setLinkStatus(null), 3000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          id="drift-story"
          aria-label={`Story from ${chapter.title}`}
          className={`${styles.panel} ${styles.glass} ${expanded ? styles.panelExpanded : ""}`}
          data-drift-ui
          initial={{
            opacity: 0,
            y: reducedMotion ? 0 : 12,
            scale: reducedMotion ? 1 : 0.985,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
          transition={{
            duration: reducedMotion ? 0 : 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <button
            className={styles.sheetHandle}
            aria-label={expanded ? "Collapse story" : "Expand story"}
            aria-expanded={expanded}
            onClick={onExpand}
            onTouchStart={(event) => {
              touchStart.current = event.touches[0].clientY;
            }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return;
              const delta =
                event.changedTouches[0].clientY - touchStart.current;
              if ((delta < -30 && !expanded) || (delta > 30 && expanded))
                onExpand();
              touchStart.current = null;
            }}
          >
            <span />
          </button>
          <div className={styles.panelToolbar}>
            <span className={styles.panelKicker}>
              <span className={styles.statusDot} />
              {chapter.isOverview ? "The journey" : "Field notes"}
            </span>
            <div className={styles.panelActions}>
              <button
                className={styles.iconButton}
                aria-label="Copy chapter link"
                title="Copy chapter link"
                onClick={copyChapterLink}
              >
                <DriftIcon
                  name={
                    linkStatus?.id === chapter.id &&
                    linkStatus.status === "copied"
                      ? "check"
                      : "link"
                  }
                  width="17"
                  height="17"
                />
              </button>
              <button
                className={styles.iconButton}
                aria-label="Close story"
                onClick={onClose}
              >
                <DriftIcon name="close" width="17" height="17" />
              </button>
            </div>
          </div>
          {linkStatus?.id === chapter.id && (
            <p className={styles.shareFeedback} role="status">
              {linkStatus.status === "copied"
                ? "Chapter link copied."
                : "Couldn’t copy. Copy the address bar instead."}
            </p>
          )}
          <div
            key={chapter.id}
            className={styles.panelScroll}
            data-drift-reading
            tabIndex={0}
            aria-label="Read this chapter"
          >
            <motion.div
              initial={{
                opacity: reducedMotion ? 1 : 0,
                y: reducedMotion ? 0 : direction * 7,
              }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.24 }}
            >
              <div className={styles.panelHeading}>
                <span className={styles.panelGroup}>
                  {group.name}
                  <span> / </span>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2>{chapter.title}</h2>
                <p className={styles.panelSubtitle}>
                  {chapter.subtitle
                    .toLocaleLowerCase()
                    .replace(
                      /(^|[·]\s*)([a-z])/g,
                      (_, lead, letter) => lead + letter.toUpperCase(),
                    )}
                </p>
              </div>
              <blockquote className={styles.panelQuote}>
                {chapter.quote}
              </blockquote>
              <div className={styles.storyDetails}>
                <div className={styles.storyRule} />
                <p className={styles.panelDescription}>{chapter.description}</p>
                {chapter.isOverview && (
                  <div className={styles.arcPlaces}>
                    <span className={styles.sectionLabel}>Along the way</span>
                    {group.ids
                      .filter((id) => id !== chapter.id)
                      .map((id) => {
                        const placeIndex = CHAPTERS.findIndex(
                          (place) => place.id === id,
                        );
                        return (
                          <button key={id} onClick={() => onSelect(placeIndex)}>
                            {CHAPTERS[placeIndex].title}
                            <DriftIcon name="arrow" width="16" height="16" />
                          </button>
                        );
                      })}
                  </div>
                )}
                {chapter.photos.length > 0 && (
                  <section
                    className={styles.panelPhotosSection}
                    aria-label={`Moments from ${chapter.title}`}
                  >
                    <span className={styles.sectionLabel}>Moments</span>
                    <div className={styles.photoStrip}>
                      {chapter.photos.map((src, photoIndex) => (
                        <div key={src} className={styles.photo}>
                          <Image
                            src={src}
                            alt={`${chapter.title}, moment ${photoIndex + 1}`}
                            fill
                            sizes="(max-width: 767px) 65vw, 260px"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                <div className={styles.panelTags}>
                  {chapter.tags.map((tag) => (
                    <span key={tag}>{tag.toLowerCase()}</span>
                  ))}
                </div>
                <div className={styles.panelFooter}>
                  <DriftIcon name="map" width="14" height="14" />
                  <span>{formatCoordinates(chapter.coordinates)}</span>
                  <span>
                    {index + 1} / {total}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          <button className={styles.mobileReadButton} onClick={onExpand}>
            {expanded ? "Less detail" : "Read the story"}
            <DriftIcon
              name="chevron"
              className={expanded ? styles.rotated : ""}
              width="16"
              height="16"
            />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
