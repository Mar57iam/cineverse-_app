export type MediaType = 'movie' | 'tv';

export interface TmdbItem {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  popularity?: number;
  releaseDate: string;
  mediaType: MediaType;
}

export interface TmdbResponse<T> {
  results: T[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

export interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  popularity?: number;
  genre_ids?: number[];
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

export interface CatalogGenre {
  id: number;
  name: string;
}

export interface CatalogPage {
  results: TmdbItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface CatalogFilters {
  query: string;
  genreId: string;
  year: string;
  minimumRating: string;
  sortBy: string;
  page: number;
}

export interface TmdbGenreResponse {
  genres: CatalogGenre[];
}

export interface TvShowDetails {
  id: number;
  name: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  first_air_date: string;
  genres: CatalogGenre[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  tagline: string;
}
