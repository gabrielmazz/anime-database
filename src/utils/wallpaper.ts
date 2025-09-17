// Utility to gather and pick wallpapers for different screens using a single module

// IMPORTANT: import.meta.glob precisa de padrões estáticos (sem variáveis dinâmicas).
// Por isso, declaramos explicitamente cada pasta suportada e selecionamos via "key".

type WallpaperKey = 'search' | 'dev' | 'selection' | 'manga' | 'intro' | 'characters' | 'topAnimes' | 'seasons';

// Coleção: Search Screen
const SEARCH_MODULES = import.meta.glob(
  '../assets/images/wallpaperSearchScreen/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

// Coleção: Dev Configurations Screen
const DEV_MODULES = import.meta.glob(
  '../assets/images/wallpaperDevConfigurationsScreen/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

// Coleção: Selection Screen
const SELECTION_MODULES = import.meta.glob(
  '../assets/images/wallpaperSelectionScreen/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

// Coleção: Manga Search Screen
const MANGA_MODULES = import.meta.glob(
  '../assets/images/wallpaperSearchScreenManga/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

// Coleção: Intro Screen
const INTRO_MODULES = import.meta.glob(
  '../assets/images/wallpaperIntroScreen/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

// Coleção: Characters Search Screen
const CHARACTERS_MODULES = import.meta.glob(
  '../assets/images/wallpaperSearchCharacters/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

// Coleção: Top Animes Screen
const TOP_ANIMES_MODULES = import.meta.glob(
  '../assets/images/wallpaperTopAnimesScreen/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

// Coleção: Explore Seasons Screen
const SEASONS_SCREEN_MODULES = import.meta.glob(
  '../assets/images/wallpaperExploreSeasons/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

const COLLECTIONS: Record<WallpaperKey, string[]> = {
  search: Object.values(SEARCH_MODULES) as string[],
  dev: Object.values(DEV_MODULES) as string[],
  selection: Object.values(SELECTION_MODULES) as string[],
  manga: Object.values(MANGA_MODULES) as string[],
  intro: Object.values(INTRO_MODULES) as string[],
  characters: Object.values(CHARACTERS_MODULES) as string[],
  topAnimes: Object.values(TOP_ANIMES_MODULES) as string[],
  seasons: Object.values(SEASONS_SCREEN_MODULES) as string[],
};

export function getAllWallpapers(key: WallpaperKey = 'search'): string[] {
  return COLLECTIONS[key] ?? [];
}

export function getRandomWallpaper(key: WallpaperKey = 'search', exclude?: string): string {
  const list = getAllWallpapers(key);
  const pool = exclude && list.length > 1 ? list.filter((w) => w !== exclude) : list;
  if (pool.length === 0) return '';
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx]!;
}
