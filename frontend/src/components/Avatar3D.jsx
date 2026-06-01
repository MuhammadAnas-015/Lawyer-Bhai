import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getAvatarClone, isAvatarReady, onAvatarReady } from "../utils/avatarPreloader";

const Avatar3D = ({ width = 300, height = 440 }) => {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let renderer, scene, camera, mixer, animId;
    let disposed = false;
    const clock = new THREE.Clock();
    const armOverrides = [];
    let hasAnimations = false;
    let baseRotY = 0;
    let rotDir = 1, rotCur = 0;
    const rotSpeed = 0.003, rotMax = 0.18;

    const init = () => {
      const fbx = getAvatarClone();
      if (!fbx || disposed) return;

      // ── Renderer ──
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(renderer.domElement);

      // ── Scene + camera ──
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);

      // ── Lighting ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const key = new THREE.DirectionalLight(0xffffff, 0.85);
      key.position.set(2, 5, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.15);
      fill.position.set(-3, 2, 2);
      scene.add(fill);

      // ── Model setup ──
      fbx.name = "__avatar__";
      fbx.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m) => {
            if (!m) return;
            if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
            if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            m.needsUpdate = true;
          });
        }
      });

      // Scale + center
      const box = new THREE.Box3().setFromObject(fbx);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 2.4 / Math.max(size.x, size.y, size.z);
      fbx.scale.setScalar(scale);
      fbx.position.set(
        -center.x * scale,
        -center.y * scale + size.y * scale * 0.08,
        -center.z * scale
      );

      // Camera framing — full body, upper 72%
      const box3 = new THREE.Box3().setFromObject(fbx);
      const size3 = box3.getSize(new THREE.Vector3());
      const min3 = box3.min;
      const focusY = min3.y + size3.y * 0.60;
      const visibleH = size3.y * 0.72;
      const fovRad = (camera.fov * Math.PI) / 180;
      const dist = (visibleH / 2) / Math.tan(fovRad / 2) + 0.5;
      camera.position.set(0, focusY, dist);
      camera.lookAt(0, focusY, 0);
      baseRotY = 0;
      fbx.rotation.y = baseRotY;

      // Animations
      if (fbx.animations?.length > 0) {
        hasAnimations = true;
        mixer = new THREE.AnimationMixer(fbx);
        const idle =
          fbx.animations.find((a) => /idle|stand|breath|wait/i.test(a.name)) ||
          fbx.animations[0];
        mixer.clipAction(idle).play();
      }

      scene.add(fbx);
      setStatus("ready");
      animate();
    };

    const animate = () => {
      if (disposed) return;
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      if (!hasAnimations && armOverrides.length) {
        armOverrides.forEach(({ bone, rx, ry, rz }) => bone.rotation.set(rx, ry, rz));
      }
      rotCur += rotSpeed * rotDir;
      if (Math.abs(rotCur) >= rotMax) rotDir *= -1;
      const avatar = scene.getObjectByName("__avatar__");
      if (avatar) avatar.rotation.y = baseRotY + rotCur;
      renderer.render(scene, camera);
    };

    // Start when avatar is ready (clone from cache)
    if (isAvatarReady()) {
      init();
    } else {
      onAvatarReady(() => { if (!disposed) init(); });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      if (mixer) mixer.stopAllAction();
      if (renderer) {
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  return (
    <div style={{ width, height, flexShrink: 0, position: "relative" }}>
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="char-3d-spinner" />
        </div>
      )}
      <div
        ref={mountRef}
        style={{ width, height, opacity: status === "ready" ? 1 : 0, transition: "opacity 0.5s" }}
      />
    </div>
  );
};

export default Avatar3D;
