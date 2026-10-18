"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import gsap from "gsap";
import {
  CHAPTERS,
  VISITED_COUNTRIES,
  LOCATION_DOTS,
} from "@/app/drift/chapters";
import { locationChapterIndex } from "@/app/drift/journey";
import styles from "@/app/drift/drift.module.css";

interface DriftMapProps {
  activeIndex: number;
  revision: number;
  zoomRequest: { delta: number; revision: number };
  panelOpen: boolean;
  expanded: boolean;
  onSelect: (index: number) => void;
  onStatusChange: (status: "loading" | "ready" | "error") => void;
  onFlyingChange: (flying: boolean) => void;
}

const WORLDVIEW_FILTER = [
  "any",
  ["==", ["get", "worldview"], "all"],
  ["in", "IN", ["get", "worldview"]],
];

export default function DriftMap({
  activeIndex,
  revision,
  zoomRequest,
  panelOpen,
  expanded,
  onSelect,
  onStatusChange,
  onFlyingChange,
}: DriftMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const cameraRef = useRef<mapboxgl.CameraOptions | null>(null);
  const pointsRef = useRef<[number, number][] | null>(null);
  const [readyMap, setReadyMap] = useState<mapboxgl.Map | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const reducedMotionRef = useRef(false);
  const consumedZoomRef = useRef(0);
  const reportStatus = useEffectEvent(onStatusChange);
  const reportFlying = useEffectEvent(onFlyingChange);
  const selectLocation = useEffectEvent(onSelect);

  const updatePath = useCallback(() => {
    const map = mapRef.current;
    const path = pathRef.current;
    if (!map || !path) return;
    path.setAttribute(
      "d",
      pointsRef.current
        ?.map((point, i) => {
          const { x, y } = map.project(point);
          return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ") ?? "",
    );
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const constellationPath = pathRef.current;
    if (!container) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches && constellationPath) {
        gsap.killTweensOf(constellationPath);
        gsap.set(constellationPath, { strokeDashoffset: 0 });
      }
      if (motionQuery.matches && mapRef.current) {
        mapRef.current.stop();
        if (cameraRef.current) mapRef.current.jumpTo(cameraRef.current);
      }
    };
    updateMotion();
    motionQuery.addEventListener("change", updateMotion);
    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container,
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        style: "mapbox://styles/mapbox/dark-v11",
        center: CHAPTERS[0].coordinates,
        zoom: CHAPTERS[0].zoom,
        bearing: 0,
        pitch: 35,
        projection: "globe",
        antialias: true,
        attributionControl: false,
      });
    } catch {
      reportStatus("error");
      motionQuery.removeEventListener("change", updateMotion);
      return;
    }
    mapRef.current = map;
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right",
    );
    map.scrollZoom.disable();
    map.dragRotate.disable();
    map.keyboard.disable();
    map.touchZoomRotate.disableRotation();
    map.touchPitch.disable();

    let loaded = false;
    const loadingTimeout = window.setTimeout(() => {
      if (!loaded) reportStatus("error");
    }, 15000);
    map.on("style.load", () => {
      // ── Restyle dark-v11 into the wikverse palette ──
      for (const layer of map.getStyle()?.layers ?? []) {
        if (layer.type === "background") {
          map.setPaintProperty(layer.id, "background-color", "#080808");
        }
        if (layer.type === "fill") {
          map.setPaintProperty(
            layer.id,
            "fill-color",
            /water/.test(layer.id)
              ? "#070707"
              : /building/.test(layer.id)
                ? "#242424"
                : "#171717",
          );
        }
        if (layer.type === "line") {
          map.setPaintProperty(
            layer.id,
            "line-color",
            /water/.test(layer.id) ? "#242424" : "#404040",
          );
        }
        if (layer.type === "hillshade") {
          map.setPaintProperty(layer.id, "hillshade-shadow-color", "#050505");
          map.setPaintProperty(
            layer.id,
            "hillshade-highlight-color",
            "#383838",
          );
          map.setPaintProperty(layer.id, "hillshade-accent-color", "#1c1c1c");
        }
        if (layer.type === "line" && layer.id.startsWith("admin")) {
          map.setPaintProperty(
            layer.id,
            "line-color",
            "rgba(255,255,255,0.16)",
          );
        }
        if (layer.type === "symbol") {
          if (/poi|road|transit|airport|ferry|golf/.test(layer.id)) {
            map.setLayoutProperty(layer.id, "visibility", "none");
          } else {
            map.setPaintProperty(
              layer.id,
              "text-color",
              "rgba(255,255,255,0.63)",
            );
            map.setPaintProperty(
              layer.id,
              "text-halo-color",
              "rgba(8,8,8,0.9)",
            );
          }
        }
      }

      // Deep-space atmosphere around the globe
      map.setFog({
        color: "rgba(16,16,16,0.9)",
        "high-color": "#080808",
        "space-color": "#080808",
        "horizon-blend": 0.04,
        "star-intensity": 0.2,
      });

      // 3D terrain — the Himalaya chapters fly at pitch 55–60 over this
      map.addSource("drift-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "drift-dem", exaggeration: 1.35 });

      // ── Country fills ──
      map.addSource("drift-countries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
        promoteId: "iso_3166_1",
      });

      const firstSymbolId = map
        .getStyle()
        ?.layers?.find((l) => l.type === "symbol")?.id;

      map.addLayer(
        {
          id: "drift-country-fill",
          type: "fill",
          source: "drift-countries",
          "source-layer": "country_boundaries",
          filter: WORLDVIEW_FILTER as never,
          paint: {
            "fill-color": "#FFFFFF",
            "fill-opacity": 0.02,
          },
        },
        firstSymbolId,
      );

      map.addLayer(
        {
          id: "drift-visited-fill",
          type: "fill",
          source: "drift-countries",
          "source-layer": "country_boundaries",
          filter: [
            "all",
            WORLDVIEW_FILTER,
            ["in", ["get", "iso_3166_1"], ["literal", VISITED_COUNTRIES]],
          ] as never,
          paint: {
            "fill-color": "#FFDA55",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.13,
              ["boolean", ["feature-state", "arc"], false],
              0.11,
              0.025,
            ] as never,
          },
        },
        firstSymbolId,
      );

      // ── Specific visited locations — brighter amber dots at 1.2x ──
      map.addSource("drift-locations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: LOCATION_DOTS.map((dot) => ({
            type: "Feature" as const,
            properties: {
              name: dot.name,
              chapterIndex: locationChapterIndex(dot.name),
            },
            geometry: {
              type: "Point" as const,
              coordinates: dot.coordinates,
            },
          })),
        },
      });
      const dotRadius = [
        "interpolate",
        ["linear"],
        ["zoom"],
        2,
        2.6,
        6,
        3.6,
        10,
        4.8,
      ] as never;
      map.addLayer({
        id: "drift-location-glow",
        type: "circle",
        source: "drift-locations",
        paint: {
          "circle-color": "#FFDA55",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            2,
            7,
            10,
            13,
          ] as never,
          "circle-blur": 1.4,
          "circle-opacity": 0.35,
        },
      });
      map.addLayer({
        id: "drift-active-ring",
        type: "circle",
        source: "drift-locations",
        filter: ["==", ["get", "chapterIndex"], 0],
        paint: {
          "circle-color": "#FFDA55",
          "circle-radius": 18,
          "circle-opacity": 0.08,
          "circle-stroke-color": "#FFDA55",
          "circle-stroke-width": 1,
          "circle-stroke-opacity": 0.55,
          "circle-pitch-scale": "viewport",
        },
      });
      map.addLayer({
        id: "drift-location-dot",
        type: "circle",
        source: "drift-locations",
        paint: {
          "circle-color": "#FFDA55",
          "circle-radius": dotRadius,
          "circle-opacity": 0.95,
        },
      });

      // Generous hit areas keep the visible map markers delicate and easy to tap.
      map.addLayer({
        id: "drift-location-hit",
        type: "circle",
        source: "drift-locations",
        paint: { "circle-radius": 22, "circle-opacity": 0 },
      });

      loaded = true;
      clearTimeout(loadingTimeout);
      setReadyMap(map);
      reportStatus("ready");
    });
    map.on("error", (event) => {
      const status = (event.error as Error & { status?: number })?.status;
      if (!loaded && (status === 401 || status === 403)) reportStatus("error");
    });
    map.on("click", "drift-location-hit", (event) => {
      const index = event.features?.[0]?.properties?.chapterIndex;
      if (typeof index === "number" && index >= 0) selectLocation(index);
    });
    map.on("mouseenter", "drift-location-hit", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "drift-location-hit", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("movestart", () => reportFlying(true));
    map.on("moveend", () => reportFlying(false));
    map.on("move", updatePath);
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      map.resize();
      setViewport({ width, height });
    });
    observer.observe(container);
    return () => {
      clearTimeout(loadingTimeout);
      observer.disconnect();
      motionQuery.removeEventListener("change", updateMotion);
      if (constellationPath) gsap.killTweensOf(constellationPath);
      map.remove();
      mapRef.current = null;
    };
  }, [updatePath]);

  useEffect(() => {
    const map = mapRef.current;
    const path = pathRef.current;
    // A recreated map must load its own layers before camera and feature updates.
    if (!map || readyMap !== map || !viewport.width) return;
    const chapter = CHAPTERS[activeIndex];
    const mobile = viewport.width < 768;
    const padding = mobile
      ? {
          top: panelOpen && expanded ? 88 : 160,
          right: 24,
          left: 24,
          bottom: panelOpen
            ? Math.min(
                viewport.height * (expanded ? 0.73 : 0.43),
                viewport.height - 150,
              )
            : 120,
        }
      : { top: 100, left: 64, right: panelOpen ? 444 : 64, bottom: 150 };
    map.stop();
    for (const iso of VISITED_COUNTRIES) {
      map.setFeatureState(
        {
          source: "drift-countries",
          sourceLayer: "country_boundaries",
          id: iso,
        },
        { arc: chapter.arcCountries?.includes(iso) ?? false },
      );
    }
    map.setFilter("drift-active-ring", [
      "==",
      ["get", "chapterIndex"],
      activeIndex,
    ]);
    map.setPaintProperty("drift-location-dot", "circle-opacity", [
      "case",
      ["==", ["get", "chapterIndex"], activeIndex],
      1,
      0.7,
    ]);

    // Attach the arc reveal before moving the camera: jumpTo fires moveend synchronously.
    if (path) {
      gsap.killTweensOf(path);
      gsap.set(path, { opacity: 0, strokeDasharray: "none" });
    }
    pointsRef.current = chapter.constellation ?? null;
    const drawArc = () => {
      if (!path || !chapter.constellation) return;
      updatePath();
      const length = path.getTotalLength();
      if (!length) return;
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: reducedMotionRef.current ? 0 : length,
        opacity: 1,
      });
      if (!reducedMotionRef.current)
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 0.65,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(path, { strokeDasharray: "none" });
          },
        });
    };
    map.once("moveend", drawArc);
    let camera: mapboxgl.CameraOptions = {
      center: chapter.coordinates,
      zoom: chapter.zoom - (mobile && chapter.isOverview ? 0.5 : 0),
      bearing: chapter.bearing,
      pitch: mobile ? Math.min(chapter.pitch, 40) : chapter.pitch,
      padding,
    };
    const destinations = LOCATION_DOTS.filter(
      (dot) => locationChapterIndex(dot.name) === activeIndex,
    );
    if (destinations.length > 1 && !chapter.isOverview) {
      const bounds = new mapboxgl.LngLatBounds();
      destinations.forEach((dot) => bounds.extend(dot.coordinates));
      const fitted = map.cameraForBounds(bounds, {
        padding: {
          top: padding.top + 16,
          right: padding.right + 16,
          bottom: padding.bottom + 16,
          left: padding.left + 16,
        },
        maxZoom: chapter.zoom,
        bearing: chapter.bearing,
        pitch: camera.pitch,
      });
      if (fitted?.center && fitted.zoom !== undefined)
        camera = { ...camera, center: fitted.center, zoom: fitted.zoom };
    }
    cameraRef.current = camera;
    if (reducedMotionRef.current) map.jumpTo(camera);
    else
      map.flyTo({
        ...camera,
        duration: chapter.isOverview ? 1500 : 1250,
        curve: 1.25,
        essential: false,
      });
    // Identical recenter requests may not emit an event.
    if (!map.isMoving()) drawArc();
    return () => {
      map.off("moveend", drawArc);
      if (path) gsap.killTweensOf(path);
    };
  }, [
    activeIndex,
    revision,
    panelOpen,
    expanded,
    readyMap,
    viewport,
    updatePath,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (
      !map ||
      readyMap !== map ||
      zoomRequest.revision <= consumedZoomRef.current
    )
      return;
    consumedZoomRef.current = zoomRequest.revision;
    if (map.isMoving() && cameraRef.current) map.jumpTo(cameraRef.current);
    const zoom = Math.max(
      map.getMinZoom(),
      Math.min(map.getMaxZoom(), map.getZoom() + zoomRequest.delta),
    );
    const camera = {
      center: map.getCenter(),
      zoom,
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    };
    cameraRef.current = camera;
    map.easeTo({
      ...camera,
      duration: reducedMotionRef.current ? 0 : 240,
      essential: false,
    });
  }, [zoomRequest, readyMap]);

  return (
    <>
      <div
        ref={containerRef}
        className={styles.mapContainer}
        aria-label="Travel map. Drag to explore, or choose a chapter below."
      />
      <svg className={styles.constellationSvg} aria-hidden="true">
        <path ref={pathRef} className={styles.constellationPath} />
      </svg>
    </>
  );
}
