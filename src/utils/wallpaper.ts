// Utility to dynamically gather and pick wallpapers from the assets folder

// Vite expands this at build time and returns URLs of imported files
const wallpaperModules = import.meta.glob(
  '../assets/images/wallpaperSearchScreen/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

const WALLPAPERS: string[] = Object.values(wallpaperModules) as string[];

export function getAllWallpapers(): string[] {
  return WALLPAPERS;
}

export function getRandomWallpaper(exclude?: string): string {
  const pool = exclude && WALLPAPERS.length > 1
    ? WALLPAPERS.filter((w) => w !== exclude)
    : WALLPAPERS;

  if (pool.length === 0) return '';
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx]!;
}


