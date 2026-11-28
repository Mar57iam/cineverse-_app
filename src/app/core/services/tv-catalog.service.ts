import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  CatalogFilters,
  CatalogGenre,
  CatalogPage,
  TmdbGenreResponse,
  TmdbItem,
  TmdbResponse,
  TmdbResult,
  TvShowDetails,
} from '../models/tmdb.model';
import { TmdbService } from './tmdb.service';

@Injectable({
  providedIn: 'root',
})
export class TvCatalogService {
  private readonly tmdbService = inject(TmdbService);

  getGenres(): Observable<CatalogGenre[]> {
    return this.tmdbService
      .get<TmdbGenreResponse>('/genre/tv/list')
      .pipe(map((response) => response.genres));
  }

  getTvShows(filters: CatalogFilters): Observable<CatalogPage> {
    const isSearch = Boolean(filters.query.trim());
    const hasFilters = Boolean(filters.genreId || filters.year || filters.minimumRating);
    let endpoint = '/discover/tv';
    let params = new HttpParams().set('page', String(filters.page));

    if (isSearch) {
      endpoint = '/search/tv';
      params = params.set('query', filters.query.trim());
      if (filters.year) {
        params = params.set('first_air_date_year', filters.year);
      }
    } else if (!hasFilters && filters.sortBy === 'popularity.desc') {
      endpoint = '/tv/popular';
    } else if (!hasFilters && filters.sortBy === 'vote_average.desc') {
      endpoint = '/tv/top_rated';
    } else {
      if (filters.genreId) {
        params = params.set('with_genres', filters.genreId);
      }
      if (filters.year) {
        params = params.set('first_air_date_year', filters.year);
      }
      if (filters.minimumRating) {
        params = params.set('vote_average.gte', filters.minimumRating);
      }
      params = params.set('sort_by', filters.sortBy);
    }

    return this.tmdbService
      .get<TmdbResponse<TmdbResult>>(endpoint, params)
      .pipe(map((response) => this.toCatalogPage(response, filters, isSearch)));
  }

  getDetails(id: string): Observable<TvShowDetails> {
    return this.tmdbService.get<TvShowDetails>(`/tv/${encodeURIComponent(id)}`);
  }

  private toCatalogPage(
    response: TmdbResponse<TmdbResult>,
    filters: CatalogFilters,
    isSearch: boolean,
  ): CatalogPage {
    let results = response.results.map((result) => this.tmdbService.toMediaItem(result, 'tv'));

    if (isSearch) {
      if (filters.genreId) {
        const genreId = Number(filters.genreId);
        results = results.filter((show) =>
          response.results.find((result) => result.id === show.id)?.genre_ids?.includes(genreId),
        );
      }
      if (filters.minimumRating) {
        const minimumRating = Number(filters.minimumRating);
        results = results.filter((show) => show.voteAverage >= minimumRating);
      }
      results = this.sortShows(results, filters.sortBy);
    }

    return {
      results,
      page: response.page ?? filters.page,
      totalPages: response.total_pages ?? 1,
      totalResults: response.total_results ?? results.length,
    };
  }

  private sortShows(shows: TmdbItem[], sortBy: string): TmdbItem[] {
    const sortedShows = [...shows];
    if (sortBy === 'vote_average.desc') {
      return sortedShows.sort((left, right) => right.voteAverage - left.voteAverage);
    }
    if (sortBy === 'first_air_date.desc') {
      return sortedShows.sort((left, right) => right.releaseDate.localeCompare(left.releaseDate));
    }
    return sortedShows.sort((left, right) => (right.popularity ?? 0) - (left.popularity ?? 0));
  }
}
