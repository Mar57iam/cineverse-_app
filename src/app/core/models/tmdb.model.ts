export type MediaType = 'movie' | 'tv';

export interface TmdbItem {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string;
  mediaType: MediaType;
}

export interface TmdbResponse<T> {
  results: T[];
}

export interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface HomePageData {
  trending: TmdbItem[];
  popular: TmdbItem[];
  topRated: TmdbItem[];
  upcoming: TmdbItem[];
  popularTv: TmdbItem[];
}
