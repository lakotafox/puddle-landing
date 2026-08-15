// Imperative bridge that lets non-shader components spawn cursor-style ripples
// in the Halcyon Gate water. `HalcyonGate` registers its spawner on mount;
// callers invoke `spawnRipple` with screen UV — sx: 0..1 left→right, sy: 0..1
// bottom→up (same convention as the shader's pointer trail). No-op until a
// spawner is registered, so callers never need to guard.

export type RippleSpawner = (sx: number, sy: number) => void;

let spawner: RippleSpawner | null = null;

export const registerRippleSpawner = (fn: RippleSpawner | null): void => {
  spawner = fn;
};

export const spawnRipple = (sx: number, sy: number): void => {
  spawner?.(sx, sy);
};
