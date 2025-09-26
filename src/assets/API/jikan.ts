// Jikan API helpers centralizados

export type Anime = {
    mal_id: number;
    title: string;
    synopsis: string;
    episodes: number;
    status: string;
    score: number;
    rating?: string; // e.g., 'PG-13', 'R - 17+', 'Rx - Hentai'
    images: {
        jpg: {
            image_url: string;
        };
    };
};

export type AnimeApiSearchResponse = {
	data: Anime[];
};

export type AnimeRandomResponse = {
  data: Anime;
};

export type AnimePicturesResponse = {
	data: Array<{
		jpg: {
			large_image_url: string;
			image_url?: string;
			small_image_url?: string;
		};
	}>;
};

export type AnimeCharactersResponse = {
	data: Array<{
		role: string;
		character: {
			name: string;
			images: {
				jpg: {
					image_url: string;
				};
			};
		};
	}>;
};

const BASE_URL = 'https://api.jikan.moe/v4';
const MAX_JIKAN_LIMIT = 25; // Limite máximo aceito pela API

// =============================
// Genres
// =============================
export type Genre = {
  mal_id: number;
  name: string;
  url?: string;
  count?: number;
  type?: 'genres' | 'explicit_genres' | 'themes' | 'demographics' | string;
};

export type GenresResponse = {
  data: Genre[];
};

export async function getAnimeGenres(): Promise<GenresResponse> {
  const response = await fetch(`${BASE_URL}/genres/anime`);
  if (!response.ok) throw new Error('Falha ao buscar gêneros de anime');
  return response.json();
}

export async function searchAnimeByName(name: string): Promise<AnimeApiSearchResponse> {
	const response = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(name)}`);
	if (!response.ok) throw new Error('Falha ao buscar animes');
	return response.json();
}

export async function getRandomAnime(): Promise<AnimeRandomResponse> {
  const response = await fetch(`${BASE_URL}/random/anime`);
  if (!response.ok) throw new Error('Falha ao sortear anime');
  return response.json();
}

// Top Animes endpoints
export async function getTopAnime(page: number = 1, limit: number = 25): Promise<AnimeApiSearchResponse> {
  // Se o limite for menor/igual ao máximo, requisição direta
  if (limit <= MAX_JIKAN_LIMIT) {
    const response = await fetch(`${BASE_URL}/top/anime?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Falha ao buscar top animes');
    return response.json();
  }

  // Acima do limite, agregamos resultados de múltiplas páginas
  const unit = MAX_JIKAN_LIMIT;
  const startIndex = (page - 1) * limit;
  const endExclusive = page * limit;
  const firstJikanPage = Math.floor(startIndex / unit) + 1;
  const lastJikanPage = Math.ceil(endExclusive / unit);

  const aggregated: Anime[] = [];
  const sliceStart = startIndex - (firstJikanPage - 1) * unit;
  for (let p = firstJikanPage; p <= lastJikanPage; p++) {
    const resp = await fetch(`${BASE_URL}/top/anime?page=${p}&limit=${unit}`);
    if (!resp.ok) throw new Error('Falha ao buscar top animes');
    const json = (await resp.json()) as AnimeApiSearchResponse;
    const items = Array.isArray(json?.data) ? json.data : [];
    aggregated.push(...items);
    if (aggregated.length >= sliceStart + limit) break;
    if (items.length < unit) break;
  }

  const data = aggregated.slice(sliceStart, sliceStart + limit);
  return { data };
}

// Listar animes por estação (temporada) e ano
export type SeasonKey = 'winter' | 'spring' | 'summer' | 'fall';

export async function getAnimeBySeason(year: number, season: SeasonKey, page: number = 1, limit: number = 25): Promise<AnimeApiSearchResponse> {
  // Limite dentro do permitido -> requisição simples
  if (limit <= MAX_JIKAN_LIMIT) {
    const response = await fetch(`${BASE_URL}/seasons/${year}/${season}?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Falha ao buscar animes da temporada');
    return response.json();
  }

  // Limite acima do permitido -> buscar em múltiplas páginas e fatiar
  const unit = MAX_JIKAN_LIMIT;
  const startIndex = (page - 1) * limit;
  const endExclusive = page * limit;
  const firstJikanPage = Math.floor(startIndex / unit) + 1;
  const lastJikanPage = Math.ceil(endExclusive / unit);

  const aggregated: Anime[] = [];
  const sliceStart = startIndex - (firstJikanPage - 1) * unit;
  for (let p = firstJikanPage; p <= lastJikanPage; p++) {
    const resp = await fetch(`${BASE_URL}/seasons/${year}/${season}?page=${p}&limit=${unit}`);
    if (!resp.ok) throw new Error('Falha ao buscar animes da temporada');
    const json = (await resp.json()) as AnimeApiSearchResponse;
    const items = Array.isArray(json?.data) ? json.data : [];
    aggregated.push(...items);
    if (aggregated.length >= sliceStart + limit) break;
    if (items.length < unit) break;
  }

  const data = aggregated.slice(sliceStart, sliceStart + limit);
  return { data };
}

export async function getAnimePictures(id: number): Promise<AnimePicturesResponse> {
	const response = await fetch(`${BASE_URL}/anime/${id}/pictures`);
	if (!response.ok) throw new Error('Falha ao buscar imagens do anime');
	return response.json();
}

export async function getAnimeCharacters(id: number): Promise<AnimeCharactersResponse> {
    const response = await fetch(`${BASE_URL}/anime/${id}/characters`);
    if (!response.ok) throw new Error('Falha ao buscar personagens do anime');
    return response.json();
}

// =============================
// Manga endpoints (análogo ao anime)
// =============================

export type Manga = {
    mal_id: number;
    title: string;
    synopsis: string;
    chapters: number | null;
    status: string;
    score: number | null;
    genres?: Array<{ mal_id: number; name: string; type?: string }>;
    explicit_genres?: Array<{ mal_id: number; name: string; type?: string }>;
    themes?: Array<{ mal_id: number; name: string; type?: string }>;
    images: {
        jpg: {
            image_url: string;
        };
    };
};

export type MangaApiSearchResponse = {
    data: Manga[];
};

export type MangaRandomResponse = {
  data: Manga;
};

export type MangaPicturesResponse = {
    data: Array<{
        jpg: {
            large_image_url: string;
            image_url?: string;
            small_image_url?: string;
        };
    }>;
};

export type MangaCharactersResponse = {
    data: Array<{
        role: string;
        character: {
            name: string;
            images: {
                jpg: {
                    image_url: string;
                };
            };
        };
    }>;
};

export async function searchMangaByName(name: string): Promise<MangaApiSearchResponse> {
    const response = await fetch(`${BASE_URL}/manga?q=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('Falha ao buscar mangás');
    return response.json();
}

export async function getMangaPictures(id: number): Promise<MangaPicturesResponse> {
    const response = await fetch(`${BASE_URL}/manga/${id}/pictures`);
    if (!response.ok) throw new Error('Falha ao buscar imagens do mangá');
    return response.json();
}

export async function getMangaCharacters(id: number): Promise<MangaCharactersResponse> {
    const response = await fetch(`${BASE_URL}/manga/${id}/characters`);
    if (!response.ok) throw new Error('Falha ao buscar personagens do mangá');
    return response.json();
}

export async function getRandomManga(): Promise<MangaRandomResponse> {
  const response = await fetch(`${BASE_URL}/random/manga`);
  if (!response.ok) throw new Error('Falha ao sortear mangá');
  return response.json();
}

// =============================
// Characters endpoints
// =============================

export type Character = {
  mal_id: number;
  name: string;
  favorites?: number;
  images?: {
    jpg?: {
      image_url?: string;
    }
  };
};

export type CharactersResponse = {
  data: Character[];
};

export async function getTopCharacters(page: number = 1, limit: number = 25): Promise<CharactersResponse> {
  // Se o limite solicitado couber no limite da API, faz requisição simples
  if (limit <= MAX_JIKAN_LIMIT) {
    const response = await fetch(`${BASE_URL}/top/characters?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Falha ao buscar personagens em destaque');
    return response.json();
  }

  // Quando o limite solicitado excede o permitido pela API, buscamos em páginas
  // múltiplas (de 25 em 25) e fatiamos o resultado para retornar exatamente
  // a quantidade pedida, respeitando a paginação "externa" (page, limit)
  const unit = MAX_JIKAN_LIMIT;
  const startIndex = (page - 1) * limit; // índice inicial absoluto
  const endExclusive = page * limit; // índice final exclusivo absoluto
  const firstJikanPage = Math.floor(startIndex / unit) + 1;
  const lastJikanPage = Math.ceil(endExclusive / unit);

  const aggregated: Character[] = [];
  const sliceStart = startIndex - (firstJikanPage - 1) * unit;
  for (let p = firstJikanPage; p <= lastJikanPage; p++) {
    const resp = await fetch(`${BASE_URL}/top/characters?page=${p}&limit=${unit}`);
    if (!resp.ok) throw new Error('Falha ao buscar personagens em destaque');
    const json = (await resp.json()) as CharactersResponse;
    const items = Array.isArray(json?.data) ? json.data : [];
    aggregated.push(...items);
    // Otimização: pare quando já tivermos dados suficientes para o recorte solicitado
    if (aggregated.length >= sliceStart + limit) break;
    // Se a página atual retornou menos itens que o unit, não há mais dados
    if (items.length < unit) break;
  }

  const data = aggregated.slice(sliceStart, sliceStart + limit);
  return { data };
}

export async function searchCharactersByName(name: string, page: number = 1, limit: number = 25): Promise<CharactersResponse> {
  const q = name.trim();

  // Limite dentro do permitido -> requisição simples
  if (limit <= MAX_JIKAN_LIMIT) {
    const response = await fetch(`${BASE_URL}/characters?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Falha ao buscar personagens');
    return response.json();
  }

  // Limite acima do permitido -> buscar em múltiplas páginas e fatiar
  const unit = MAX_JIKAN_LIMIT;
  const startIndex = (page - 1) * limit;
  const endExclusive = page * limit;
  const firstJikanPage = Math.floor(startIndex / unit) + 1;
  const lastJikanPage = Math.ceil(endExclusive / unit);

  const aggregated: Character[] = [];
  const sliceStart = startIndex - (firstJikanPage - 1) * unit;
  for (let p = firstJikanPage; p <= lastJikanPage; p++) {
    const resp = await fetch(`${BASE_URL}/characters?q=${encodeURIComponent(q)}&page=${p}&limit=${unit}`);
    if (!resp.ok) throw new Error('Falha ao buscar personagens');
    const json = (await resp.json()) as CharactersResponse;
    const items = Array.isArray(json?.data) ? json.data : [];
    aggregated.push(...items);
    if (aggregated.length >= sliceStart + limit) break;
    if (items.length < unit) break;
  }

  const data = aggregated.slice(sliceStart, sliceStart + limit);
  return { data };
}

// Detalhes completos do personagem
export type CharacterFullResponse = {
  data: {
    mal_id: number;
    name: string;
    about?: string | null;
    images?: any;
    favorites?: number;
    anime?: Array<{ role?: string; anime?: { title?: string } }>;
    manga?: Array<{ role?: string; manga?: { title?: string } }>;
  };
};

export async function getCharacterFull(id: number): Promise<CharacterFullResponse> {
  const response = await fetch(`${BASE_URL}/characters/${id}/full`);
  if (!response.ok) throw new Error('Falha ao buscar detalhes do personagem');
  return response.json();
}

// =============================
// Producers endpoints
// =============================

export type Producer = {
  mal_id: number;
  // A lista básica de produtores (GET /producers) não retorna "name",
  // e sim um array de "titles" com o título Default/Japanese/Synonym.
  // Já o endpoint de detalhes (/producers/{id}/full) retorna "name".
  name?: string;
  titles?: Array<{ type?: string; title?: string }>;
  favorites?: number | null;
  established?: string | null;
  images?: {
    jpg?: {
      image_url?: string;
    };
  };
  url?: string;
  count?: number;
};

export type ProducersResponse = { data: Producer[] };

export type ProducerFullResponse = {
  data: {
    mal_id: number;
    name: string;
    established?: string | null;
    favorites?: number | null;
    about?: string | null;
    images?: any;
    anime?: Array<{ title?: string }>; // lista simples de obras
  };
};

export async function getProducers(page: number = 1, limit: number = 25): Promise<ProducersResponse> {
  const response = await fetch(`${BASE_URL}/producers?page=${page}&limit=${Math.min(limit, MAX_JIKAN_LIMIT)}`);
  if (!response.ok) throw new Error('Falha ao listar produtores');
  return response.json();
}

export async function searchProducersByName(name: string, page: number = 1, limit: number = 25): Promise<ProducersResponse> {
  const q = (name || '').trim();
  const url = q
    ? `${BASE_URL}/producers?q=${encodeURIComponent(q)}&page=${page}&limit=${Math.min(limit, MAX_JIKAN_LIMIT)}`
    : `${BASE_URL}/producers?page=${page}&limit=${Math.min(limit, MAX_JIKAN_LIMIT)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao buscar produtores');
  return response.json();
}

export async function getProducerFull(id: number): Promise<ProducerFullResponse> {
  const response = await fetch(`${BASE_URL}/producers/${id}/full`);
  if (!response.ok) throw new Error('Falha ao buscar detalhes do produtor');
  return response.json();
}
