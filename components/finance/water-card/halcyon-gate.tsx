"use client";

// Halcyon Gate — a self-contained WebGL water scene: the whole image is a single
// quad fragment shader (sky, moon, stars, clouds, brass ring, reflective sea)
// rendered through an EffectComposer.
//
// Originally written as a fixed full-viewport background. Here it is a *bounded
// section* instead, which changes three things:
//
//   1. Every measurement is taken from the host element's rect, not the window —
//      the original's window.innerWidth/innerHeight would have stretched the
//      scene across the whole page and mapped the pointer to the wrong place.
//   2. Rendering is gated on visibility. A full water shader with postprocessing
//      running the entire time the user is elsewhere on the page is pure wasted
//      GPU, so an IntersectionObserver parks the RAF loop when it scrolls away.
//   3. The reveal is driven by an `active` prop (the section coming into view)
//      rather than the template's preloader store.
//
// Also: the original used THREE.WebGL1Renderer, removed in three r163. This uses
// WebGLRenderer — the GLSL1 shader still compiles on a WebGL2 context.

import { useEffect, useRef } from "react";

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

import { registerRippleSpawner } from "@/lib/animation/ripple-bus";

// --- Scene definition (baked-in constants) -------------------------------

const hexToVec3 = (hex: string): THREE.Vector3 => {
  const n = parseInt(hex.replace("#", ""), 16);
  return new THREE.Vector3(
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  );
};

// Neutral, not tinted. This started as a violet night scene; a cyan retint just
// traded one coloured scene for another and still competed with the card. These
// are pure greys — no hue at all — so the only colour anywhere in the frame is
// the card itself, which is the thing worth looking at. Values keep the original
// contrast structure so the horizon, reflection and glint all still read.
const COLORS = {
  skyTop: "#050507",
  skyHorizon: "#3A3A3F",
  // The one warm note in an otherwise neutral scene — a dim, hazy sun rather
  // than a bright one. It bleeds into the horizon haze, the glint on the
  // waterline and the reflection, so a single value warms the whole middle of
  // the frame without tinting the greys.
  sun: "#D9B877",
  cloudLit: "#6E6E76",
  cloudDark: "#1C1C20",
  waterDeep: "#050506",
  goldLight: "#242428",
  goldDark: "#161619",
} as const;

const P = {
  horizon: 0.435,
  sunX: 0.5,
  sunY: 0.39,
  sunGlow: 0.25,
  sunCore: 0.146,
  sunBright: 1.3,
  cloudScale: 3.2,
  cloudSpeed: 0.05,
  cloudCover: 0.23,
  cloudSoft: 0.55,
  cloudOpacity: 0.23,
  ringX: 0.495,
  ringR: 0.36,
  tube: 0.004,
  goldSpec: 2,
  goldRim: 1.5,
  camHeight: 0.1,
  waveScale: 1.8,
  waveDetail: 0.92,
  waveSpeed: 0.42,
  waveAmp: 0.028,
  stretch: 0.6,
  edgePos: 0.035,
  edgeSoft: 0.005,
  ripFreq: 48,
  ripDecay: 2.2,
  ripSize: 3.9,
  ripAmp: 0.54,
  reflLow: 0.06,
  reflHigh: 1,
  reflFall: 12,
  sparkle: 0,
  starBright: 0.98,
  starDensity: 114,
  starAmount: 0.08,
  brightness: 0.95,
  grain: 0,
  mouseLerp: 0.63,
} as const;

const NRIP = 28;
const RIPPLE_STEP = 0.018; // screen-distance throttle between trail drops

const VERT = /* glsl */ `
void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
#define PI 3.14159265
#define NRIP 28
uniform vec2  uRes, uMouse;
uniform vec2  uRipPos[NRIP];
uniform float uRipAge[NRIP];
uniform float uTime;
uniform float uHorizon, uSunX, uSunY, uSunGlow, uSunCore, uSunBright;
uniform float uCloudScale, uCloudSpeed, uCloudCover, uCloudSoft, uCloudOpac;
uniform float uRingX, uRingR, uTube, uGoldSpec, uGoldRim;
uniform float uCamH, uWaveScale, uWaveDetail, uWaveSpeed, uWaveAmp, uStretch;
uniform float uRipFreq, uRipDecay, uRipFalloff, uRipAmp;
uniform float uEdgePos, uEdgeSoft;
uniform float uReflLow, uReflHigh, uReflFall, uSparkle;
uniform float uStarBright, uStarDens, uStarAmt;
uniform float uBright, uGrain;
uniform vec3  ucSkyTop, ucSkyHorizon, ucSun, ucCloudLit, ucCloudDark, ucWaterDeep, ucGoldLight, ucGoldDark;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  // 4 octaves: octaves 5-6 are <5% amplitude at high frequency and
  // invisible under the soft clouds — trimmed for performance.
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ s += a * noise(p); p = p * 2.02 + vec2(11.3, 7.7); a *= 0.5; }
  return s;
}
float aspect(){ return uRes.x / uRes.y; }

// SKY + SUN + CLOUDS + RING above the waterline. Given a screen-space
// coordinate (which may be a mirrored sample for the water reflection)
// returns the colour of the world. The ring is a full circle here, but
// we only ever sample its UPPER half above the horizon, so the lower
// half is never drawn directly — its reflection is the mirrored sample.
vec3 worldColor(vec2 uv){
  float ar = aspect();

  // vertical sky gradient: warm peachy gold at the horizon -> cool blue up high
  float st = clamp((uv.y - uHorizon) / max(0.0001, 1.0 - uHorizon), 0.0, 1.0);
  vec3 col = mix(ucSkyHorizon, ucSkyTop, pow(st, 0.7));

  // the moon, low behind the ring: a soft cool glow + a bright disc
  vec2 sun = vec2(uSunX, uSunY);
  vec2 ds = uv - sun; ds.x *= ar;
  float sd = length(ds);
  float glow = exp(-sd * sd / (uSunGlow * uSunGlow));
  float core = exp(-sd * sd / (uSunCore * uSunCore));
  col = mix(col, ucSun, glow * 0.5);
  col += ucSun * core * uSunBright;

  // starfield: sparse twinkling points, denser high in the sky, none at the
  // horizon and washed out near the moon. One per grid cell at a random
  // in-cell position. Painted before clouds so the clouds occlude them, and
  // mirrored into the water (worldColor also paints the reflection sample).
  vec2 sp = vec2(uv.x * ar, uv.y) * uStarDens;
  vec2 scell = floor(sp);
  float sh = hash(scell);
  if (sh > 1.0 - uStarAmt) {
    vec2 sc = vec2(hash(scell + 1.7), hash(scell + 4.3));
    float sdist = length(fract(sp) - sc);
    float tw = 0.55 + 0.45 * sin(uTime * 2.5 + sh * 80.0);
    float star = smoothstep(0.12, 0.0, sdist) * tw;
    star *= smoothstep(uHorizon + 0.02, uHorizon + 0.3, uv.y);  // fade in above the horizon
    star *= 1.0 - glow * 0.9;                                    // the moon washes out nearby stars
    col += star * ucSun * uStarBright;
  }

  // drifting cumulus clouds, denser up high, thinning toward the horizon
  vec2 cp = vec2(uv.x * ar, uv.y) * uCloudScale;
  cp += vec2(uTime * uCloudSpeed + uMouse.x * 0.04, -uTime * uCloudSpeed * 0.25);
  float base = fbm(cp);
  float form = fbm(cp * 2.1 + base * 1.6);
  float mask = smoothstep(uCloudCover, uCloudCover + uCloudSoft, base * 0.62 + form * 0.5);
  mask *= smoothstep(uHorizon - 0.04, uHorizon + 0.16, uv.y);   // few clouds right at the horizon
  float lit = smoothstep(0.28, 0.82, form);                      // billow tops catch the light
  vec3 cloud = mix(ucCloudDark, ucCloudLit, lit);
  cloud = mix(cloud, ucSun, glow * 0.35);                        // warm the clouds near the sun
  col = mix(col, cloud, mask * uCloudOpac);

  // BRASS RING — a polished gold torus standing on the horizon, shaded
  // as a real metal tube: it MIRRORS the surrounding scene (warm sky on
  // the up-faces, dark sea on the down-faces), tinted by a gold albedo,
  // with a crisp sun glint and fresnel-bright silhouette edges.
  vec2 dr = uv - vec2(uRingX, uHorizon); dr.x *= ar;
  float rr = length(dr);
  float band = abs(rr - uRingR);
  float aa = max(1.3 / uRes.y, uTube * 0.12);                     // ~1px crisp but anti-aliased edge
  float ring = smoothstep(uTube + aa, uTube - aa, band);
  if (ring > 0.001){
    vec2 rad = dr / max(rr, 1e-4);                                // outward radial unit
    float a = clamp((rr - uRingR) / uTube, -1.0, 1.0);           // -1..1 across the tube
    float round = sqrt(max(0.0, 1.0 - a * a));                    // 1 at tube centre -> 0 at edge
    vec3 N = normalize(vec3(rad * a, round + 1e-4));             // tube surface normal (z = toward camera)
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 L = normalize(vec3(normalize(sun - vec2(uRingX, uHorizon)) * 0.9, 0.55));

    // environment reflection: the metal mirrors its surroundings, faked
    // from the reflected ray's vertical — up reflects the warm bright sky,
    // down reflects the dark sea, and the sun's glow warms the near side.
    vec3 Rr = reflect(-V, N);
    float upf = Rr.y;
    vec3 env = mix(ucWaterDeep * 1.3, ucSkyHorizon, smoothstep(-0.7, 0.15, upf));
    env = mix(env, ucSkyTop * 1.12, smoothstep(0.15, 0.9, upf));
    env = mix(env, ucSun, glow * 0.55);                          // warm where it faces the sun
    float envLum = dot(env, vec3(0.35, 0.4, 0.25));

    // gold albedo colours the reflection (metals tint what they reflect)
    vec3 albedo = mix(ucGoldDark, ucGoldLight, 0.5 + 0.5 * upf);
    vec3 g = albedo * (0.32 + 1.05 * envLum);

    // sharp sun specular — a small hot glint, not a rotating band
    vec3 H = normalize(L + V);
    float spec = pow(max(0.0, dot(N, H)), 110.0);
    g += spec * ucSun * (1.0 + uGoldSpec);

    // broad satin sheen across the upper face of the tube
    float sheen = pow(max(0.0, dot(N, normalize(vec3(0.0, 0.9, 0.7)))), 3.5);
    g += sheen * ucGoldLight * 0.22;

    // fresnel rim brightening at the tube's grazing silhouette edges
    g += pow(1.0 - round, 3.0) * mix(ucGoldLight, ucSun, 0.4) * uGoldRim;

    // gentle backlight where the slender ring crosses the sun core
    g += ucSun * core * 0.5;

    col = mix(col, g, ring);
  }
  return col;
}

// Map a screen point below the horizon onto the WATER PLANE in world
// coords: wz is the distance into the scene (camera height uCamH over a
// pinhole looking at the horizon -> dist = camH / screenDropBelowHorizon),
// wx is the horizontal world position (fans out with distance). This is
// what makes the waves recede correctly and the cursor ripples sit flat
// on the sea in perspective.
vec2 waterPlane(vec2 uv){
  float ar = aspect();
  float b = max(uHorizon - uv.y, 0.0008);
  float wz = uCamH / b;
  float wx = (uv.x - 0.5) * ar * wz;
  return vec2(wx, wz);
}

// water surface height field, evaluated in world-plane coords so waves
// have true perspective: long swells travelling toward the viewer + fine
// wind chop whose detail fades with distance (anti-aliases the horizon),
// plus the cursor-trail ripples (true circles on the plane).
float waterH(vec2 uv){
  vec2 w = waterPlane(uv);
  float wx = w.x, wz = w.y;
  float fade = 1.0 / (1.0 + wz * wz * uWaveDetail);   // kill fine detail far away
  float t = uTime * uWaveSpeed;
  float s = uWaveScale;
  float h = 0.0;
  // directional swells (gerstner-ish), rolling in toward the camera
  h += sin((wz * 1.0 + wx * 0.15) * s - t * 1.0) * 0.55;
  h += sin((wz * 1.9 - wx * 0.40) * s - t * 1.5) * 0.32 * mix(0.5, 1.0, fade);
  h += sin((wz * 3.3 + wx * 0.85) * s - t * 2.1) * 0.18 * fade;
  // fine wind chop
  h += (fbm(vec2(wx, wz) * s * 1.3 + vec2(0.0, -t * 0.6)) - 0.5) * 0.8 * fade;

  // cursor-trail ripples — circular on the water PLANE (world coords),
  // so they read in perspective and align flat with the sea. Each ripple
  // eases IN over ~0.35s (onset) so it swells up smoothly instead of
  // popping, and is attenuated by the distance fade so far ones don't
  // alias into flicker.
  for (int i = 0; i < NRIP; i++){
    float age = uRipAge[i];
    // onset (eases in) * decay (fades out). Both depend only on age, which
    // is the SAME for every fragment, so this early-out is coherent across
    // the warp (no divergence) and skips the sqrt/sin/exp for dead slots —
    // typically only a handful of the NRIP ripples are alive at once.
    float env = smoothstep(0.0, 0.35, age) * exp(-age * uRipDecay);
    if (env < 0.002) continue;
    float dist = length(w - uRipPos[i]);
    // calm the very centre (smoothstep up from 0, scaled to the wavelength)
    // so the ripple reads as expanding rings, not a bright cusp/dot under
    // the cursor — that central apex is what looked like a "poke".
    float clear = smoothstep(0.0, 2.5 / uRipFreq, dist);
    h += sin(dist * uRipFreq - age * uRipDecay * 4.0)
         * env * exp(-dist * uRipFalloff) * uRipAmp * fade * clear;
  }
  return h;
}

// the reflected water colour at a screen point (mirror of the world,
// distorted by the ripple/wave slope), independent of the horizon split.
vec3 waterColor(vec2 uv, float ar){
  float depth = max(uHorizon - uv.y, 0.0);
  // slope of the surface (finite difference) drives the refraction wobble
  float e = 0.0016;
  float hx = waterH(uv + vec2(e, 0.0)) - waterH(uv - vec2(e, 0.0));
  float hy = waterH(uv + vec2(0.0, e)) - waterH(uv - vec2(0.0, e));
  vec2 slope = clamp(vec2(hx, hy) / (2.0 * e), -40.0, 40.0);  // clamp tames the horizon
  float amp = uWaveAmp * (depth + 0.02);

  vec2 ruv;
  ruv.x = uv.x + slope.x * amp;
  ruv.y = uHorizon + depth * uStretch + slope.y * amp;  // mirrored back up above the horizon
  vec3 refl = worldColor(ruv);

  // fresnel: grazing (near the horizon) reflects strongly, foreground less
  float fres = mix(uReflLow, uReflHigh, exp(-depth * uReflFall));
  vec3 col = mix(ucWaterDeep, refl, fres);

  // let the brightest reflections (sun + gold) punch through the dark water
  float lum = dot(refl, vec3(0.299, 0.587, 0.114));
  col += refl * smoothstep(0.6, 1.05, lum) * 0.6;

  // glittering sun path: high-frequency sparkle on the bright reflections
  float glit = pow(noise(vec2(uv.x * ar, uv.y) * 240.0 + vec2(0.0, -uTime * 3.0)), 5.0);
  col += glit * smoothstep(0.5, 0.95, lum) * ucSun * uSparkle;
  return col;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float ar = aspect();

  // Cross-fade sky -> water across a soft, controllable band at the
  // waterline so the sea can melt into the sky. To stay cheap, ONLY the
  // thin band evaluates both layers: the pure-sky region skips the
  // (expensive) water path entirely, and pure water skips the sky clouds.
  // uEdgePos shifts the waterline (down into the water = +), uEdgeSoft is
  // the half-width of the fade (0 -> a hard horizon, large -> hazy fade).
  float center = uHorizon - uEdgePos;
  float soft   = max(uEdgeSoft, 0.0005);
  vec3 col;
  if (uv.y > center + soft) {
    col = worldColor(uv);                                       // pure sky
  } else if (uv.y < center - soft) {
    col = waterColor(uv, ar);                                   // pure water
  } else {
    float waterMask = smoothstep(center + soft, center - soft, uv.y);
    col = mix(worldColor(uv), waterColor(uv, ar), waterMask);   // soft band only
  }

  // soft horizon haze + a thin bright glint along the waterline
  float hl = exp(-abs(uv.y - center) * 60.0);
  col += hl * ucSun * 0.12 * exp(-pow((uv.x - uSunX) * 2.0, 2.0));

  col *= uBright;

  // film grain
  col += (hash(uv * uRes + uTime) - 0.5) * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
`;

// The sun core eases from a pinprick to its resting size as the card surfaces,
// driven by the shared reveal flag (see use-preloader).
const SUNCORE_START = 0.01;
const SUNCORE_END = 0.294;

// The sun holds back until the card has fully surfaced and settled, then comes
// up behind it — two clearly separate beats, so they don't compete. TiltCard
// takes 450ms of still water plus a ~2s spring, so this starts a beat *after*
// the card has come to rest rather than overlapping the end of the ascent.
const SUN_DELAY_MS = 2600;
// Time constant for the exponential ease: the value closes (1 - e^-dt/tau) of
// the remaining gap each frame, so 1.15 puts it ~63% up after 1.15s and
// visually finished around 3s. The whole sequence then lands near 5.5s, which
// is about as long as anyone actually spends on one section — an earlier pass
// at 3.6 stretched it past 15s, so nobody would ever have seen the end of it.
const SUN_EASE_TAU = 1.15;

export interface HalcyonGateProps {
  className?: string;
  /** Section is in view — grows the sun core, same role the preloader had. */
  active?: boolean;
}

export const HalcyonGate = ({ className, active = false }: HalcyonGateProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read inside the RAF loop without re-running the setup effect.
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // The canvas fills the section, so its own box is the measurement source.
    const host = canvas.parentElement ?? canvas;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);

    const rect = () => {
      const r = host.getBoundingClientRect();
      // Guard the first frame: a zero-height box yields NaN aspect and a black canvas.
      return { w: Math.max(1, r.width), h: Math.max(1, r.height), top: r.top, left: r.left };
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, rect().w / rect().h, 0.1, 10);
    camera.position.set(0, 0, 1);

    // ripple pool
    const ripPos: THREE.Vector2[] = [];
    const ripAge: number[] = [];
    const ripBirth: number[] = [];
    for (let i = 0; i < NRIP; i++) {
      ripPos.push(new THREE.Vector2(0, 0));
      ripAge.push(1e3);
      ripBirth.push(-1e3);
    }
    let ripIdx = 0;

    const uRes = new THREE.Vector2(1, 1);
    const uMouse = new THREE.Vector2(0, 0);

    const uniforms: Record<string, THREE.IUniform> = {
      uRes: { value: uRes },
      uTime: { value: 0 },
      uMouse: { value: uMouse },
      uRipPos: { value: ripPos },
      uRipAge: { value: ripAge },
      uCamH: { value: P.camHeight },
      uRipFreq: { value: P.ripFreq },
      uRipDecay: { value: P.ripDecay },
      uRipFalloff: { value: P.ripSize },
      uRipAmp: { value: P.ripAmp },
      uEdgePos: { value: P.edgePos },
      uEdgeSoft: { value: P.edgeSoft },
      uHorizon: { value: P.horizon },
      uSunX: { value: P.sunX },
      uSunY: { value: P.sunY },
      uSunGlow: { value: P.sunGlow },
      uSunCore: { value: SUNCORE_START },
      uSunBright: { value: P.sunBright },
      uCloudScale: { value: P.cloudScale },
      uCloudSpeed: { value: P.cloudSpeed },
      uCloudCover: { value: P.cloudCover },
      uCloudSoft: { value: P.cloudSoft },
      uCloudOpac: { value: P.cloudOpacity },
      uRingX: { value: P.ringX },
      uRingR: { value: P.ringR },
      uTube: { value: P.tube },
      uGoldSpec: { value: P.goldSpec },
      uGoldRim: { value: P.goldRim },
      uWaveScale: { value: P.waveScale },
      uWaveDetail: { value: P.waveDetail },
      uWaveSpeed: { value: P.waveSpeed },
      uWaveAmp: { value: P.waveAmp },
      uStretch: { value: P.stretch },
      uReflLow: { value: P.reflLow },
      uReflHigh: { value: P.reflHigh },
      uReflFall: { value: P.reflFall },
      uSparkle: { value: P.sparkle },
      uStarBright: { value: P.starBright },
      uStarDens: { value: P.starDensity },
      uStarAmt: { value: P.starAmount },
      uBright: { value: P.brightness },
      uGrain: { value: P.grain },
      ucSkyTop: { value: hexToVec3(COLORS.skyTop) },
      ucSkyHorizon: { value: hexToVec3(COLORS.skyHorizon) },
      ucSun: { value: hexToVec3(COLORS.sun) },
      ucCloudLit: { value: hexToVec3(COLORS.cloudLit) },
      ucCloudDark: { value: hexToVec3(COLORS.cloudDark) },
      ucWaterDeep: { value: hexToVec3(COLORS.waterDeep) },
      ucGoldLight: { value: hexToVec3(COLORS.goldLight) },
      ucGoldDark: { value: hexToVec3(COLORS.goldDark) },
    };

    const gateMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), gateMat);
    quad.frustumCulled = false;
    scene.add(quad);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(GammaCorrectionShader));

    const resize = () => {
      const { w, h } = rect();
      // Cap well below the device ratio. This shader is fill-rate bound — every
      // pixel runs the full water/sky/reflection evaluation, and then the
      // EffectComposer pays for it a second time on the gamma pass. At DPR 2 on
      // a retina display that was ~3.8M pixels twice per frame, which is what
      // made the section stutter. The scene is soft and out-of-focus by nature,
      // so the resolution drop is close to invisible.
      const dpr = Math.min(window.devicePixelRatio, 1.35);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
      uRes.copy(renderer.getDrawingBufferSize(new THREE.Vector2()));
    };
    // ResizeObserver rather than a window listener: the section can change height
    // from reflow (font load, responsive breakpoints) with no window resize event.
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // pointer-driven ripple trail
    const mouse = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector2(0, 0);
    let lastSx = -1e3;
    let lastSy = -1e3;

    const dropRipple = (sx: number, sy: number) => {
      const b = P.horizon - sy;
      if (b <= 0.012) return; // only over the water
      const { w, h } = rect();
      const ar = w / h;
      const wz = P.camHeight / b;
      const wx = (sx - 0.5) * ar * wz;
      ripPos[ripIdx].set(wx, wz);
      ripBirth[ripIdx] = performance.now() / 1000;
      ripIdx = (ripIdx + 1) % NRIP;
    };

    // let other components (e.g. the emerging card) spawn ripples on this water
    registerRippleSpawner(dropRipple);

    const onPointerMove = (e: PointerEvent) => {
      // Section-relative, so the trail follows the cursor over *this* water
      // rather than being offset by however far down the page the section sits.
      const { w, h, top, left } = rect();
      const sx = (e.clientX - left) / w;
      const sy = 1 - (e.clientY - top) / h;
      if (sx < 0 || sx > 1 || sy < 0 || sy > 1) return; // pointer is elsewhere on the page
      mouseTarget.set(sx * 2 - 1, sy * 2 - 1);
      if (Math.hypot(sx - lastSx, sy - lastSy) > RIPPLE_STEP) {
        dropRipple(sx, sy);
        lastSx = sx;
        lastSy = sy;
      }
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let lastT = performance.now() / 1000;
    let raf = 0;
    let activeAt = 0; // seconds, stamped when the section first comes into view
    const render = () => {
      raf = requestAnimationFrame(render);
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - lastT);
      lastT = now;

      mouse.lerp(mouseTarget, P.mouseLerp);
      uMouse.copy(mouse);
      uniforms.uTime.value = now;

      // Sun core grows once the section is in view.
      // Stamp the moment the section went active, then hold the sun down until
      // the card has nearly finished rising. Timed off the clock rather than a
      // second prop so it can't drift out of sync with a paused RAF loop.
      if (activeRef.current && activeAt === 0) activeAt = now;
      const sunReleased =
        activeAt !== 0 && (now - activeAt) * 1000 >= SUN_DELAY_MS;
      const sunCoreTarget = sunReleased ? SUNCORE_END : SUNCORE_START;
      const sc = uniforms.uSunCore;
      sc.value +=
        (sunCoreTarget - (sc.value as number)) * (1 - Math.exp(-dt / SUN_EASE_TAU));

      for (let i = 0; i < NRIP; i++) ripAge[i] = now - ripBirth[i];

      composer.render();
    };

    // Only burn GPU while the section is actually on screen. Without this the
    // shader would render continuously for the whole visit.
    let running = false;
    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      lastT = performance.now() / 1000; // avoid a huge dt after being parked
      render();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "200px" }, // spin up just before it scrolls in
    );
    io.observe(host);

    if (reduceMotion) {
      // honour prefers-reduced-motion: paint one static frame, no loop/trail.
      uniforms.uSunCore.value = SUNCORE_END;
      composer.render();
    } else {
      window.addEventListener("pointermove", onPointerMove);
      // Paint one frame immediately. The RAF loop only starts once the section
      // intersects, and requestAnimationFrame doesn't fire at all while the tab
      // is in the background — so without this the canvas can sit empty and the
      // section reads as a black hole in the page until the loop finally runs.
      composer.render();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      registerRippleSpawner(null);
      window.removeEventListener("pointermove", onPointerMove);
      quad.geometry.dispose();
      gateMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 block h-full w-full ${className ?? ""}`}
    />
  );
};
