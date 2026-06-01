import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils";

let preloadedFBX = null;
let loading = false;
const callbacks = [];

export const preloadAvatar = () => {
  if (preloadedFBX || loading) return;
  loading = true;
  const loader = new FBXLoader();
  loader.load(
    "/avatar.fbx",
    (fbx) => {
      preloadedFBX = fbx;
      loading = false;
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    },
    undefined,
    () => { loading = false; }
  );
};

// Returns a fresh independent clone (with its own skeleton + animations)
export const getAvatarClone = () => {
  if (!preloadedFBX) return null;
  const c = skeletonClone(preloadedFBX);
  c.animations = preloadedFBX.animations; // share clip data (read-only)
  return c;
};

export const isAvatarReady = () => !!preloadedFBX;

export const onAvatarReady = (cb) => {
  if (preloadedFBX) { cb(); return; }
  callbacks.push(cb);
};
