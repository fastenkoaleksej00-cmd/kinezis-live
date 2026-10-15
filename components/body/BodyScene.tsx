"use client";

import { useEffect, useRef } from "react";
import type * as T from "three";
import { regionAt, regionIds, regions, type RegionId } from "@/lib/body/regions";

export type SceneStatus = "loading" | "ready" | "error";

export interface BodySceneApi {
  rotateBy: (deg: number) => void;
  zoomBy: (factor: number) => void;
  setDrag: (on: boolean) => void;
}

interface BodySceneProps {
  modelUrl: string;
  /** Called once the scene is ready with the control API (rotate, zoom, drag toggle) */
  onApi?: (api: BodySceneApi) => void;
  selected: RegionId | null;
  view: "front" | "back";
  reduceMotion: boolean;
  dark: boolean;
  onSelect: (id: RegionId | null) => void;
  onStatus: (s: SceneStatus) => void;
  labels: Record<RegionId, string>;
}

const HEIGHT = 1.75;

/**
 * three.js view of the KINEZIS skeleton (single mesh, no rig). Regions are world-space boxes,
 * so a tap selects the area the hit point falls in, not an individual bone. Vertices inside the
 * selected region are tinted through vertex colours, the rest is dimmed.
 */
export function BodyScene({ modelUrl, selected, view, reduceMotion, dark, onSelect, onStatus, labels, onApi }: BodySceneProps) {
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ paint: (i: number) => void; setView: (v: "front" | "back", instant: boolean) => void; setDark: (d: boolean) => void; rotateBy: (deg: number) => void; zoomBy: (factor: number) => void; setDrag: (on: boolean) => void } | null>(null);
  const selectedRef = useRef<RegionId | null>(selected);
  selectedRef.current = selected;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [THREE, { GLTFLoader }, { OrbitControls }] = await Promise.all([import("three"), import("three/examples/jsm/loaders/GLTFLoader.js"), import("three/examples/jsm/controls/OrbitControls.js")]);
        if (disposed) return;
        let needsRender = true;

        // Phones: lower pixel ratio and no MSAA keep memory down, which is what makes iOS Safari drop WebGL contexts
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const dpr = Math.min(window.devicePixelRatio, coarse ? 1.5 : 2);
        const renderer = new THREE.WebGLRenderer({ antialias: dpr <= 1.5, alpha: true, powerPreference: "default" });
        renderer.setPixelRatio(dpr);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        host.appendChild(renderer.domElement);
        renderer.domElement.style.display = "block";
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 20);
        const target = new THREE.Vector3(0, HEIGHT * 0.52, 0);

        const hemi = new THREE.HemisphereLight(0xf5f8f8, 0x31525d, 0.8);
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(1.4, 2.6, 2.2);
        const fill = new THREE.DirectionalLight(0xc5e0e9, 0.5);
        fill.position.set(-1.6, 1.2, 1.2);
        const rim = new THREE.DirectionalLight(0x8edcf0, 1.3);
        rim.position.set(0, 1.8, -2.4);
        scene.add(hemi, key, fill, rim);

        const gltf = await new GLTFLoader().loadAsync(modelUrl);
        if (disposed) {
          renderer.dispose();
          renderer.domElement.remove();
          return;
        }
        const scan = gltf.scene;
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xeef3f5, roughness: 0.6, metalness: 0.02, vertexColors: true });
        const meshes: T.Mesh[] = [];
        scan.traverse((o) => {
          const m = o as T.Mesh;
          if (m.isMesh) {
            m.material = boneMat;
            meshes.push(m);
          }
        });

        // Normalise: height 1.75 m, feet at y = 0, centred, facing +z (same convention as the region boxes)
        scan.updateMatrixWorld(true);
        let box = new THREE.Box3().setFromObject(scan);
        const size = box.getSize(new THREE.Vector3());
        const longest = Math.max(size.x, size.y, size.z);
        const wrap = new THREE.Group();
        wrap.add(scan);
        if (size.z === longest) scan.rotation.x = -Math.PI / 2;
        else if (size.x === longest) scan.rotation.z = -Math.PI / 2;
        wrap.updateMatrixWorld(true);
        box = new THREE.Box3().setFromObject(wrap);
        wrap.scale.setScalar(HEIGHT / (box.max.y - box.min.y));
        wrap.updateMatrixWorld(true);
        box = new THREE.Box3().setFromObject(wrap);
        const c = box.getCenter(new THREE.Vector3());
        wrap.position.set(-c.x, -box.min.y, -c.z);
        wrap.updateMatrixWorld(true);
        scene.add(wrap);

        // Tag vertices with their region (first match wins, same order as `regions`)
        const painters = meshes.map((mesh) => {
          const geo = mesh.geometry as T.BufferGeometry;
          const pos = geo.attributes.position;
          const n = pos.count;
          const zone = new Int8Array(n).fill(-1);
          const v = new THREE.Vector3();
          mesh.updateMatrixWorld(true);
          for (let i = 0; i < n; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
            const id = regionAt(v);
            zone[i] = id ? regionIds.indexOf(id) : -1;
          }
          const colors = new Float32Array(n * 3);
          geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          return { geo, zone, colors, n };
        });

        let isDark = dark;
        const paint = (zoneIndex: number) => {
          const base = isDark ? new THREE.Color(0.92, 0.95, 0.96) : new THREE.Color(1, 1, 1);
          const dim = isDark ? new THREE.Color(0.5, 0.57, 0.61) : new THREE.Color(0.66, 0.73, 0.77);
          const hi = base.clone().lerp(new THREE.Color(0x2a86b4), 0.85);
          for (const p of painters) {
            for (let i = 0; i < p.n; i++) {
              const col = zoneIndex < 0 ? base : p.zone[i] === zoneIndex ? hi : dim;
              p.colors[i * 3] = col.r;
              p.colors[i * 3 + 1] = col.g;
              p.colors[i * 3 + 2] = col.b;
            }
            (p.geo.attributes.color as T.BufferAttribute).needsUpdate = true;
          }
          needsRender = true;
        };

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(target);
        controls.enablePan = false;
        controls.minDistance = 1.3;
        controls.maxDistance = 4.2;
        controls.minPolarAngle = Math.PI * 0.25;
        controls.maxPolarAngle = Math.PI * 0.72;
        controls.enableDamping = true;
        controls.dampingFactor = 0.055;
        controls.rotateSpeed = 0.85;
        // Touch screens: the page must scroll freely over the model, so gestures do not drive the camera.
        // Rotation and zoom come from the on-screen buttons (or the optional drag toggle). Mouse users keep drag.
        controls.enablePan = false;
        const setDrag = (on: boolean) => {
          const allow = on || !coarse;
          controls.enableRotate = allow;
          controls.enableZoom = allow;
          renderer.domElement.style.touchAction = allow ? "none" : "auto";
        };
        setDrag(false);

        const dist = 3.1;
        const place = (azimuth: number) => camera.position.set(Math.sin(azimuth) * dist, target.y + 0.15, Math.cos(azimuth) * dist);
        place(0);
        camera.lookAt(target);

        let anim: { from: T.Vector3; to: T.Vector3; start: number } | null = null;
        const azimuthOf = () => Math.atan2(camera.position.x, camera.position.z);
        const rotateBy = (deg: number) => {
          const az = azimuthOf() + (deg * Math.PI) / 180;
          const d = camera.position.distanceTo(target);
          const to = new THREE.Vector3(Math.sin(az) * d, camera.position.y, Math.cos(az) * d);
          if (reduceMotion) {
            camera.position.copy(to);
            anim = null;
          } else anim = { from: camera.position.clone(), to, start: performance.now() };
          needsRender = true;
        };
        const zoomBy = (factor: number) => {
          const d = Math.min(controls.maxDistance, Math.max(controls.minDistance, camera.position.distanceTo(target) * factor));
          const az = azimuthOf();
          const to = new THREE.Vector3(Math.sin(az) * d, camera.position.y, Math.cos(az) * d);
          if (reduceMotion) {
            camera.position.copy(to);
            anim = null;
          } else anim = { from: camera.position.clone(), to, start: performance.now() };
          needsRender = true;
        };
        const setView = (v: "front" | "back", instant: boolean) => {
          const to = new THREE.Vector3();
          const az = v === "front" ? 0 : Math.PI;
          to.set(Math.sin(az) * camera.position.distanceTo(target), camera.position.y, Math.cos(az) * camera.position.distanceTo(target));
          if (instant) {
            camera.position.copy(to);
            anim = null;
          } else anim = { from: camera.position.clone(), to, start: performance.now() };
          needsRender = true;
        };

        // Tap vs drag: select only when the pointer barely moved
        const ray = new THREE.Raycaster();
        const ndc = new THREE.Vector2();
        let down: { x: number; y: number } | null = null;
        const onDown = (e: PointerEvent) => {
          down = { x: e.clientX, y: e.clientY };
        };
        const onUp = (e: PointerEvent) => {
          if (!down) return;
          const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
          down = null;
          if (moved > 6) return;
          const rect = renderer.domElement.getBoundingClientRect();
          ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
          ray.setFromCamera(ndc, camera);
          const hit = ray.intersectObjects(meshes, false)[0];
          onSelect(hit ? regionAt(hit.point) : null);
        };
        renderer.domElement.addEventListener("pointerdown", onDown);
        renderer.domElement.addEventListener("pointerup", onUp);

        const resize = () => {
          const w = host.clientWidth;
          const h = host.clientHeight;
          if (w === 0 || h === 0) return;
          // Keep the CSS size equal to the host: on hi-DPI screens the drawing buffer is larger than the box
          renderer.setSize(w, h, true);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          needsRender = true;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        const anchor = new THREE.Vector3();
        let raf = 0;
        let lastInteraction = 0;
        const requestRender = () => {
          needsRender = true;
        };
        controls.addEventListener("change", () => {
          lastInteraction = performance.now();
          requestRender();
        });
        // Pause the loop while the tab is hidden or the scene is scrolled away
        let visible = true;
        const io = new IntersectionObserver((entries) => {
          visible = entries[0]?.isIntersecting ?? true;
          if (visible) requestRender();
        });
        io.observe(host);
        const onVisibility = () => {
          if (!document.hidden) requestRender();
        };
        document.addEventListener("visibilitychange", onVisibility);
        // Context loss (memory pressure on phones): keep the canvas, re-render when the browser gives the context back
        const onLost = (e: Event) => {
          e.preventDefault();
        };
        const onRestored = () => {
          paint(selectedRef.current ? regionIds.indexOf(selectedRef.current) : -1);
          requestRender();
        };
        renderer.domElement.addEventListener("webglcontextlost", onLost);
        renderer.domElement.addEventListener("webglcontextrestored", onRestored);

        const loop = (now: number) => {
          raf = requestAnimationFrame(loop);
          if (!visible || document.hidden) return;
          if (anim) {
            const t = Math.min(1, (now - anim.start) / 600);
            const e = 1 - Math.pow(1 - t, 3);
            camera.position.lerpVectors(anim.from, anim.to, e);
            if (t >= 1) anim = null;
            needsRender = true;
          }
          // Damping keeps moving for a moment after the finger lifts
          if (now - lastInteraction < 1200) needsRender = true;
          if (!needsRender) return;
          needsRender = false;
          controls.update();
          renderer.render(scene, camera);
          // Project every region anchor to the screen; hide dots that face away from the camera
          const rect = renderer.domElement.getBoundingClientRect();
          const sel = selectedRef.current;
          regions.forEach((r, i) => {
            const el = dotRefs.current[i];
            if (!el) return;
            anchor.set(...r.anchor).project(camera);
            const facing = r.view === "both" || r.anchor[2] * camera.position.z >= 0;
            const visible = facing && anchor.z < 1;
            el.style.transform = `translate(${((anchor.x + 1) / 2) * rect.width}px, ${((1 - anchor.y) / 2) * rect.height}px) translate(-50%, -50%)`;
            el.style.opacity = visible ? "1" : "0";
            el.style.pointerEvents = visible ? "auto" : "none";
            el.dataset.active = sel === r.id ? "true" : "false";
          });
        };
        raf = requestAnimationFrame(loop);

        api.current = {
          paint,
          setView,
          setDark: (d) => {
            isDark = d;
            paint(selectedRef.current ? regionIds.indexOf(selectedRef.current) : -1);
          },
          rotateBy,
          zoomBy,
          setDrag,
        };
        onApi?.({ rotateBy, zoomBy, setDrag });
        paint(selectedRef.current ? regionIds.indexOf(selectedRef.current) : -1);
        setView(view, true);
        onStatus("ready");

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
          renderer.domElement.removeEventListener("webglcontextlost", onLost);
          renderer.domElement.removeEventListener("webglcontextrestored", onRestored);
          renderer.domElement.removeEventListener("pointerdown", onDown);
          renderer.domElement.removeEventListener("pointerup", onUp);
          controls.dispose();
          painters.forEach((p) => p.geo.dispose());
          boneMat.dispose();
          renderer.dispose();
          renderer.domElement.remove();
          api.current = null;
        };
      } catch {
        if (!disposed) onStatus("error");
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
    // Scene is built once; selection, view and theme are pushed through `api`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl]);

  useEffect(() => {
    api.current?.paint(selected ? regionIds.indexOf(selected) : -1);
  }, [selected]);

  useEffect(() => {
    api.current?.setView(view, reduceMotion);
  }, [view, reduceMotion]);

  useEffect(() => {
    api.current?.setDark(dark);
  }, [dark]);

  return (
    <>
      <div ref={hostRef} className="absolute inset-0" aria-hidden />
      {regions.map((r, i) => (
        <button
          key={r.id}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          type="button"
          aria-label={labels[r.id]}
          aria-pressed={selected === r.id}
          data-active="false"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(selected === r.id ? null : r.id);
          }}
          className="group absolute top-0 left-0 flex items-center gap-2 opacity-0 transition-opacity duration-300 data-[active=true]:z-10"
        >
          <span className="relative block h-5 w-5">
            <span className="bg-accent absolute inset-0 rounded-full opacity-25 transition-transform duration-300 group-data-[active=true]:scale-[1.9]" />
            <span className="absolute inset-[5px] rounded-full border-2 border-white bg-accent shadow-[0_2px_8px_rgba(16,36,43,0.35)] transition-transform duration-300 group-hover:scale-110 group-data-[active=true]:inset-[3px]" />
          </span>
          <span className="pointer-events-none hidden rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-ink shadow-[var(--shadow-card)] backdrop-blur-md group-data-[active=true]:block">
            {labels[r.id]}
          </span>
        </button>
      ))}
    </>
  );
}

export const regionCount = regions.length;
