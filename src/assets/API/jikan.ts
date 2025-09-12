// Jikan API helpers centralizados

export type Anime = {
  mal_id: number;
  title: string;
  synopsis: string;
  episodes: number;
  status: string;
  score: number;
  images: {
    jpg: {
      image_url: string;
    };
  };
};

export type AnimeApiSearchResponse = {
  data: Anime[];
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

export async function searchAnimeByName(name: string): Promise<AnimeApiSearchResponse> {
  const response = await fetch(`${BASE_URL}/anime?q=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error('Falha ao buscar animes');
  return response.json();
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

