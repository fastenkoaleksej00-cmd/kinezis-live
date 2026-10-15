"use client";

import { useEffect, useRef } from "react";
import type * as T from "three";
import { regionAt, regionById, regionIds, regions, type RegionId } from "@/lib/body/regions";

export type SceneStatus = "loading" | "ready" | "error";

interface BodySceneProps {
  modelUrl: string;
  selected: RegionId | null;
  view: "front" | "back";
  reduceMotion: boolean;
  dark: boolean;
  onSelect: (id: RegionId | null) => void;
  onStatus: (s: SceneStatus) => void;
  /** Receives screen coordinates of the selected region's anchor every frame */
  markerRef: React.RefObject<HTMLDivElement | null>;
}

const HEIGHT = 1.75;

/**
 * three.js view of the KINEZIS skeleton (single mesh, no rig). Regions are world-space boxes,
 * so a tap selects the area the hit point falls in, not an individual bone. Vertices inside the
 * selected region are tinted through vertex colours, the rest is dimmed.
 */
export function BodyScene({ modelUrl, selected, view, reduceMotion, dark, onSelect, onStatus, markerRef }: BodySceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ paint: (i: number) => void; setView: (v: "front" | "back", instant: boolean) => void; setDark: (d: boolean) => void } | null>(null);
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

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        host.appendChild(renderer.domElement);
        renderer.domElement.style.touchAction = "none";

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
        if (disposed) return;
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
          const dim = isDark ? new THREE.Color(0.55, 0.62, 0.66) : new THREE.Color(0.72, 0.78, 0.81);
          const hi = base.clone().lerp(new THREE.Color(0x2a86b4), 0.72);
          for (const p of painters) {
            for (let i = 0; i < p.n; i++) {
              const col = zoneIndex < 0 ? base : p.zone[i] === zoneIndex ? hi : dim;
              p.colors[i * 3] = col.r;
              p.colors[i * 3 + 1] = col.g;
              p.colors[i * 3 + 2] = col.b;
            }
            (p.geo.attributes.color as T.BufferAttribute).needsUpdate = true;
          }
        };

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(target);
        controls.enablePan = false;
        controls.minDistance = 1.3;
        controls.maxDistance = 4.2;
        controls.minPolarAngle = Math.PI * 0.25;
        controls.maxPolarAngle = Math.PI * 0.72;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;

        const dist = 3.1;
        const place = (azimuth: number) => camera.position.set(Math.sin(azimuth) * dist, target.y + 0.15, Math.cos(azimuth) * dist);
        place(0);
        camera.lookAt(target);

        let anim: { from: T.Vector3; to: T.Vector3; start: number } | null = null;
        const setView = (v: "front" | "back", instant: boolean) => {
          const to = new THREE.Vector3();
          const az = v === "front" ? 0 : Math.PI;
          to.set(Math.sin(az) * camera.position.distanceTo(target), camera.position.y, Math.cos(az) * camera.position.distanceTo(target));
          if (instant) {
            camera.position.copy(to);
            anim = null;
          } else anim = { from: camera.position.clone(), to, start: performance.now() };
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
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        const anchor = new THREE.Vector3();
        let raf = 0;
        const loop = (now: number) => {
          raf = requestAnimationFrame(loop);
          if (anim) {
            const t = Math.min(1, (now - anim.start) / 600);
            const e = 1 - Math.pow(1 - t, 3);
            camera.position.lerpVectors(anim.from, anim.to, e);
            if (t >= 1) anim = null;
          }
          controls.update();
          renderer.render(scene, camera);
          const marker = markerRef.current;
          const sel = selectedRef.current;
          if (marker) {
            if (sel) {
              anchor.set(...regionById[sel].anchor).project(camera);
              const rect = renderer.domElement.getBoundingClientRect();
              const x = ((anchor.x + 1) / 2) * rect.width;
              const y = ((1 - anchor.y) / 2) * rect.height;
              const visible = anchor.z < 1;
              marker.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
              marker.style.opacity = visible ? "1" : "0";
            } else marker.style.opacity = "0";
          }
        };
        raf = requestAnimationFrame(loop);

        api.current = {
          paint,
          setView,
          setDark: (d) => {
            isDark = d;
            paint(selectedRef.current ? regionIds.indexOf(selectedRef.current) : -1);
          },
        };
        paint(selectedRef.current ? regionIds.indexOf(selectedRef.current) : -1);
        setView(view, true);
        onStatus("ready");

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
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

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}

export const regionCount = regions.length;
