"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CHAPTERS, VISITED_COUNTRIES } from "@/app/drift/chapters";
import { formatCoordinates, journeyGroup } from "@/app/drift/journey";
import DriftPanel from "./DriftPanel";
import DriftNav from "./DriftNav";
import DriftIcon from "./DriftIcon";
import useDriftChapter, { navigateToChapter } from "./useDriftChapter";
import styles from "@/app/drift/drift.module.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DriftMap = dynamic(() => import("./DriftMap"), { ssr: false });
const subscribeNarrowCanvas = (listener: () => void) => {
  const query = window.matchMedia("(max-width: 1280px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const getNarrowCanvas = () => window.matchMedia("(max-width: 1280px)").matches;
const getServerNarrowCanvas = () => false;

export default function DriftExperience() {
  const activeIndex = useDriftChapter();
  const [selection, setSelection] = useState({
    direction: 1,
    revision: 0,
  });
  const [zoomRequest, setZoomRequest] = useState({ delta: 0, revision: 0 });
  const [panelOpen, setPanelOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [isFlying, setIsFlying] = useState(false);
  const [mapAttempt, setMapAttempt] = useState(0);
  const storyButtonRef = useRef<HTMLButtonElement>(null);
  const wheelRef = useRef({ delta: 0, time: 0, lastChange: 0 });
  const isNarrowCanvas = useSyncExternalStore(
    subscribeNarrowCanvas,
    getNarrowCanvas,
    getServerNarrowCanvas,
  );
  const chapter = CHAPTERS[activeIndex];
  const hasToken =
    Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== "your_mapbox_token_here";

  const selectChapter = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(CHAPTERS.length - 1, index));
      setSelection((prev) => ({
        direction: next >= activeIndex ? 1 : -1,
        revision: prev.revision + 1,
      }));
      setPickerOpen(false);
      navigateToChapter(next);
    },
    [activeIndex],
  );

  const closeStory = useCallback(() => {
    setPanelOpen(false);
    setExpanded(false);
    storyButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    // Keep the site's moving grain out of Elsewhere's glass surfaces.
    document.documentElement.dataset.elsewhere = "true";
    return () => {
      delete document.documentElement.dataset.elsewhere;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (pickerOpen) setPickerOpen(false);
        else if (expanded) setExpanded(false);
        else if (panelOpen) closeStory();
        return;
      }
      const target = event.target as HTMLElement;
      if (
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        pickerOpen ||
        target.closest(
          "button, a, input, textarea, select, [contenteditable], [data-drift-reading]",
        )
      )
        return;
      if (
        [
          "ArrowRight",
          "ArrowDown",
          "PageDown",
          "ArrowLeft",
          "ArrowUp",
          "PageUp",
        ].includes(event.key)
      ) {
        event.preventDefault();
        selectChapter(
          activeIndex +
            (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key)
              ? 1
              : -1),
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, pickerOpen, expanded, panelOpen, closeStory, selectChapter]);

  return (
    <main
      className={styles.experience}
      onWheel={(event) => {
        if (
          pickerOpen ||
          event.ctrlKey ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
          (event.target as HTMLElement).closest("[data-drift-ui]")
        )
          return;
        const now = performance.now();
        const wheel = wheelRef.current;
        // One chapter per deliberate gesture, without carrying trackpad inertia forward.
        if (
          now - wheel.time > 180 ||
          Math.sign(wheel.delta) !== Math.sign(event.deltaY)
        )
          wheel.delta = 0;
        wheel.time = now;
        if (now - wheel.lastChange < 850) return;
        wheel.delta +=
          event.deltaY *
          (event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? window.innerHeight
              : 1);
        if (Math.abs(wheel.delta) >= 70) {
          selectChapter(activeIndex + Math.sign(wheel.delta));
          wheel.delta = 0;
          wheel.lastChange = now;
        }
      }}
    >
      {hasToken && (
        <DriftMap
          key={mapAttempt}
          activeIndex={activeIndex}
          revision={selection.revision}
          zoomRequest={zoomRequest}
          panelOpen={panelOpen}
          expanded={expanded}
          onSelect={(index) => {
            selectChapter(index);
            setPanelOpen(true);
          }}
          onStatusChange={setMapStatus}
          onFlyingChange={setIsFlying}
        />
      )}
      <div className={styles.mapVignette} aria-hidden="true" />
      <header className={styles.topbar} data-drift-ui>
        <div className={styles.brand}>
          <Link
            href="/"
            className={`${styles.iconButton} ${styles.homeButton}`}
            aria-label="Back to wikverse"
          >
            <DriftIcon name="back" />
          </Link>
          <div>
            <h1>
              Elsewhere<span className={styles.brandStar}>✳</span>
            </h1>
            <p>A personal atlas</p>
          </div>
        </div>
        <div className={styles.atlasMeta}>
          <span className={styles.statusDot} />
          <span>{VISITED_COUNTRIES.length} countries</span>
          <span className={styles.metaSeparator}>/</span>
          <span>{CHAPTERS.length} chapters</span>
        </div>
      </header>
      <div className={styles.mapTools} data-drift-ui>
        <div className={styles.zoomControls + " " + styles.glass}>
          {[1, -1].map((delta) => (
            <button
              key={delta}
              className={styles.iconButton}
              aria-label={delta > 0 ? "Zoom in" : "Zoom out"}
              disabled={mapStatus !== "ready" || !hasToken || isFlying}
              onClick={() =>
                setZoomRequest((prev) => ({
                  delta,
                  revision: prev.revision + 1,
                }))
              }
            >
              <DriftIcon name={delta > 0 ? "plus" : "minus"} />
            </button>
          ))}
        </div>
        <button
          className={`${styles.iconButton} ${styles.glass}`}
          onClick={() => selectChapter(activeIndex)}
          aria-label="Recenter on current destination"
          title="Recenter"
        >
          <DriftIcon name="locate" />
        </button>
      </div>
      {(!hasToken || mapStatus !== "ready") && (
        <div className={styles.mapMessage} role="status">
          <DriftIcon name="globe" />
          <span>
            {hasToken && mapStatus === "loading"
              ? "Finding our way…"
              : "The map is taking a moment."}
          </span>
          <p>
            {hasToken && mapStatus === "loading"
              ? "Your stories are already here."
              : "You can still explore every chapter below."}
          </p>
          {hasToken && mapStatus === "error" && (
            <button
              className={styles.textButton}
              onClick={() => {
                setMapStatus("loading");
                setIsFlying(false);
                setMapAttempt((prev) => prev + 1);
              }}
            >
              Try the map again
            </button>
          )}
        </div>
      )}
      <div className={styles.journeyCaption} aria-hidden="true">
        <span className={styles.eyebrow}>A little further from home</span>
        <p>
          Places I went.
          <br />
          <span>Things I brought back.</span>
        </p>
        <div>
          <span className={styles.captionLine} />
          {journeyGroup(chapter.id).name}
          <span className={styles.captionCoordinates}>
            {formatCoordinates(chapter.coordinates)}
          </span>
        </div>
      </div>
      <DriftPanel
        chapter={chapter}
        index={activeIndex}
        total={CHAPTERS.length}
        direction={selection.direction}
        open={panelOpen && !(isNarrowCanvas && pickerOpen)}
        expanded={expanded}
        onExpand={() => setExpanded((prev) => !prev)}
        onClose={closeStory}
        onSelect={selectChapter}
      />
      <DriftNav
        chapters={CHAPTERS}
        activeIndex={activeIndex}
        onSelect={selectChapter}
        pickerOpen={pickerOpen}
        onPickerChange={setPickerOpen}
        panelOpen={panelOpen}
        onStoryToggle={() => {
          if (pickerOpen) {
            setPickerOpen(false);
            setPanelOpen(true);
          } else setPanelOpen((prev) => !prev);
        }}
        storyButtonRef={storyButtonRef}
        isFlying={isFlying}
      />
      <p className={styles.navigationHint}>
        Scroll to wander<span>·</span>Drag to explore
      </p>
      <span
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {chapter.title}. Chapter {activeIndex + 1} of {CHAPTERS.length}.
      </span>
    </main>
  );
}
