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

function circularDeltaDeg(a: number, b: number): number {
    // Smallest absolute difference between two angles in degrees
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
}

function hslDistance(a: HSL, b: HSL): number {
    // Perceptual-ish distance in HSL with tuned weights
    const dh = circularDeltaDeg(a.h, b.h) / 180; // [0..1]
    const ds = Math.abs(a.s - b.s);
    const dl = Math.abs(a.l - b.l);
    const wH = 0.6, wS = 0.8, wL = 1.0; // prioritize lightness separation
    return Math.sqrt((wH * dh) ** 2 + (wS * ds) ** 2 + (wL * dl) ** 2);
}

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

function hexToRgb(hex: string): RGB | null {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const Hp = ((h % 360) + 360) % 360 / 60;
  const X = C * (1 - Math.abs((Hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (0 <= Hp && Hp < 1) { r1 = C; g1 = X; b1 = 0; }
  else if (1 <= Hp && Hp < 2) { r1 = X; g1 = C; b1 = 0; }
  else if (2 <= Hp && Hp < 3) { r1 = 0; g1 = C; b1 = X; }
  else if (3 <= Hp && Hp < 4) { r1 = 0; g1 = X; b1 = C; }
  else if (4 <= Hp && Hp < 5) { r1 = X; g1 = 0; b1 = C; }
  else { r1 = C; g1 = 0; b1 = X; }
  const m = l - C / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

function adjustHexLightness(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb);
  const l = clamp01(hsl.l + delta);
  const out = hslToRgb({ h: hsl.h, s: hsl.s, l });
  return rgbToHex(out);
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

// (legacy helper removido – não utilizado)

export async function extractPaletteFromImage(
    src: string,
    opts: { sampleSize?: number; step?: number } = {}
): Promise<Palette> {
    // Slightly higher default resolution + finer buckets to capture nuances
    const sampleSize = opts.sampleSize ?? 160; // canvas size for sampling
    const step = opts.step ?? 16; // bucket size (larger => fewer buckets)

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
        .slice(0, 48) // consider more buckets initially
        .map(([key, b]) => {
            const count = b.count;
            const rgb: RGB = { r: b.r / count, g: b.g / count, b: b.b / count };
            const hsl = rgbToHsl(rgb);
            return { key, count, rgb, hsl };
        })
        // Filter out near-black/white hard extremes that skew categories
        .filter(({ hsl }) => hsl.l > 0.05 && hsl.l < 0.95);

    // Greedy diversification: ensure a spread across hue/sat/lightness
    function diversify<T extends { hsl: HSL }>(
        list: (T & { count: number })[],
        target: number,
        minD = 0.22 // minimal HSL distance between picks
    ): (T & { count: number })[] {
        const picks: (T & { count: number })[] = [];
        for (const c of list) {
            const ok = picks.every((p) => hslDistance(p.hsl, c.hsl) >= minD);
            if (ok) picks.push(c);
            if (picks.length >= target) break;
        }
        // if not enough, relax constraint gradually
        let relax = minD * 0.8;
        while (picks.length < target && relax > 0.05) {
            for (const c of list) {
                if (picks.includes(c)) continue;
                const ok = picks.every((p) => hslDistance(p.hsl, c.hsl) >= relax);
                if (ok) picks.push(c);
                if (picks.length >= target) break;
            }
            relax *= 0.8;
        }
        return picks;
    }

    // Diversified candidate pool ordered by frequency and spread
    const diverse = diversify(sorted, 24);

    // helpers to pick color by predicates, while penalizing similarity to already chosen ones
    const chosen: HSL[] = [];
    const by = (pred: (x: typeof diverse[number]) => number | false) => {
        let best: typeof diverse[number] | undefined;
        let bestScore = -Infinity;
        for (const item of diverse) {
            const base = pred(item);
            if (base === false) continue;
            // similarity penalty
            const penalty = chosen.length
                ? 1 - Math.max(...chosen.map((c) => Math.exp(-4 * hslDistance(c, item.hsl))))
                : 1;
            const score = base * penalty;
            if (score > bestScore) { best = item; bestScore = score; }
        }
        if (best) chosen.push(best.hsl);
        return best?.rgb ?? diverse[0]?.rgb ?? avg;
    };

    const dominant = diverse[0]?.rgb ?? avg;

    // Choose palettes with simple heuristics on saturation/lightness
    const vibrant = by(({ hsl, count }) => {
        const s = hsl.s; const l = hsl.l;
        if (l < 0.35 || l > 0.75) return false;
        if (s < 0.35) return false;
        // favor high saturation, mid lightness, and frequency
        const lightnessCenter = 0.55;
        const lScore = 1 - Math.abs(l - lightnessCenter);
        return count * (0.5 + 0.8 * s + 0.6 * lScore);
    });

    const darkVibrant = by(({ hsl, count }) => {
        const s = hsl.s; const l = hsl.l;
        if (l > 0.45) return false;
        if (s < 0.25) return false;
        return count * (0.4 + 0.7 * s) * (1 - l);
    });

    const lightVibrant = by(({ hsl, count }) => {
        const s = hsl.s; const l = hsl.l;
        if (l < 0.6) return false;
        if (s < 0.25) return false;
        return count * (0.4 + 0.7 * s) * l;
    });

    const muted = by(({ hsl, count }) => {
        const s = hsl.s; const l = hsl.l;
        if (s > 0.45) return false;
        if (l < 0.3 || l > 0.8) return false;
        return count * (1.0 - s) * (0.7 + (1 - Math.abs(l - 0.5)));
    });

    const darkMuted = by(({ hsl, count }) => {
        const s = hsl.s; const l = hsl.l;
        if (l > 0.5) return false; // dark
        if (s > 0.5) return false; // muted
        return count * (1.0 - s) * (1 - l);
    });

    const lightMuted = by(({ hsl, count }) => {
        const s = hsl.s; const l = hsl.l;
        if (l < 0.6) return false;
        if (s > 0.5) return false;
        return count * (1.0 - s) * l;
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
  // Painel mais escuro por padrão: escurece um pouco mais a base
  const panelDarker = adjustHexLightness(c5, -0.05);
  root.style.setProperty('--panel-bg', hexWithAlpha(panelDarker, 'F0'));
  root.style.setProperty('--panel-border', hexWithAlpha(c3, '99'));
}
