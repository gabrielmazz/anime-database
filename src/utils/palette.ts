export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export type Palette = {
  dominant: string;
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  muted: string;
  darkMuted: string;
  lightMuted: string;
  average: string;
};

function clamp01(n: number) { return Math.min(1, Math.max(0, n)); }

function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`;
}

function hexWithAlpha(hex: string, alphaHex: string): string {
  if (/^#?[0-9a-fA-F]{6}$/.test(hex)) {
    const clean = hex.startsWith('#') ? hex.slice(1) : hex;
    return `#${clean}${alphaHex}`;
  }
  return hex; // fallback
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type Bucket = {
  count: number;
  r: number; g: number; b: number; // running sums for average per bucket
};

function bucketKey(r: number, g: number, b: number, step: number): string {
  const br = Math.floor(r / step) * step;
  const bg = Math.floor(g / step) * step;
  const bb = Math.floor(b / step) * step;
  return `${br},${bg},${bb}`;
}

function toRgb(key: string): RGB {
  const [r, g, b] = key.split(',').map((v) => parseInt(v, 10));
  return { r, g, b };
}

export async function extractPaletteFromImage(
  src: string,
  opts: { sampleSize?: number; step?: number } = {}
): Promise<Palette> {
  const sampleSize = opts.sampleSize ?? 120; // canvas size for sampling
  const step = opts.step ?? 24; // bucket size (larger => fewer buckets)

  const img = await loadImage(src);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // keep aspect ratio while bounding box to sampleSize
  const ratio = img.width / img.height;
  const w = ratio >= 1 ? sampleSize : Math.max(1, Math.round(sampleSize * ratio));
  const h = ratio >= 1 ? Math.max(1, Math.round(sampleSize / ratio)) : sampleSize;

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);

  const buckets = new Map<string, Bucket>();
  let avgR = 0, avgG = 0, avgB = 0, avgCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 16) continue; // skip near-transparent
    const r = data[i], g = data[i + 1], b = data[i + 2];

    // running average for overall average color
    avgR += r; avgG += g; avgB += b; avgCount++;

    const key = bucketKey(r, g, b, step);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { count: 0, r: 0, g: 0, b: 0 };
      buckets.set(key, bucket);
    }
    bucket.count++;
    bucket.r += r; bucket.g += g; bucket.b += b;
  }

  const avg: RGB = avgCount
    ? { r: avgR / avgCount, g: avgG / avgCount, b: avgB / avgCount }
    : { r: 0, g: 0, b: 0 };

  // sort buckets by count (desc) and take top candidates
  const sorted = Array.from(buckets.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 24)
    .map(([key, b]) => {
      const count = b.count;
      const rgb: RGB = { r: b.r / count, g: b.g / count, b: b.b / count };
      const hsl = rgbToHsl(rgb);
      return { key, count, rgb, hsl };
    });

  // helpers to pick color by predicates
  const by = (pred: (x: typeof sorted[number]) => number | false) => {
    let best: typeof sorted[number] | undefined;
    let bestScore = -Infinity;
    for (const item of sorted) {
      const score = pred(item);
      if (score === false) continue;
      if (score > bestScore) { best = item; bestScore = score; }
    }
    return best?.rgb ?? sorted[0]?.rgb ?? avg;
  };

  const dominant = sorted[0]?.rgb ?? avg;

  // Choose palettes with simple heuristics on saturation/lightness
  const vibrant = by(({ hsl, count }) => {
    const s = hsl.s; const l = hsl.l;
    if (l < 0.3 || l > 0.8) return false;
    return count * (0.6 + s); // favor saturation + frequency
  });

  const darkVibrant = by(({ hsl, count }) => {
    const s = hsl.s; const l = hsl.l;
    if (l > 0.45) return false;
    return count * (0.5 + s) * (1 - l);
  });

  const lightVibrant = by(({ hsl, count }) => {
    const s = hsl.s; const l = hsl.l;
    if (l < 0.55) return false;
    return count * (0.5 + s) * l;
  });

  const muted = by(({ hsl, count }) => {
    const s = hsl.s; const l = hsl.l;
    if (s > 0.5) return false;
    if (l < 0.25 || l > 0.8) return false;
    return count * (0.9 - s);
  });

  const darkMuted = by(({ hsl, count }) => {
    const s = hsl.s; const l = hsl.l;
    if (l > 0.5) return false; // dark
    if (s > 0.5) return false; // muted
    return count * (0.9 - s) * (1 - l);
  });

  const lightMuted = by(({ hsl, count }) => {
    const s = hsl.s; const l = hsl.l;
    if (l < 0.5) return false;
    if (s > 0.5) return false;
    return count * (0.9 - s) * l;
  });

  const palette: Palette = {
    dominant: rgbToHex(dominant),
    vibrant: rgbToHex(vibrant),
    darkVibrant: rgbToHex(darkVibrant),
    lightVibrant: rgbToHex(lightVibrant),
    muted: rgbToHex(muted),
    darkMuted: rgbToHex(darkMuted),
    lightMuted: rgbToHex(lightMuted),
    average: rgbToHex(avg),
  };

  return palette;
}

export function applyPaletteToCssVariables(palette: Palette) {
  const root = document.documentElement;

  // Map palette to your existing CSS variables
  const c1 = palette.lightVibrant || palette.lightMuted || palette.vibrant || palette.average;
  const c2 = palette.lightMuted || palette.muted || palette.average;
  const c3 = palette.vibrant || palette.dominant;
  const c4 = palette.darkVibrant || palette.muted || palette.dominant;
  const c5 = palette.darkMuted || palette.darkVibrant || palette.dominant;

  root.style.setProperty('--color1', c1);
  root.style.setProperty('--color1-shadow', hexWithAlpha(c1, '80'));
  root.style.setProperty('--color2', c2);
  root.style.setProperty('--color3', c3);
  root.style.setProperty('--color4', c4);
  root.style.setProperty('--color5', c5);

  // Extras para UI dinâmica
  root.style.setProperty('--accent', c3);
  root.style.setProperty('--panel-bg', hexWithAlpha(c5, 'F0')); // painéis levemente translúcidos
  root.style.setProperty('--panel-border', hexWithAlpha(c3, '99'));
}
