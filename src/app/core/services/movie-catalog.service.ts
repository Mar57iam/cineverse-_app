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
} from '../models/tmdb.model';
import { TmdbService } from './tmdb.service';

@Injectable({
  providedIn: 'root',
})
export class MovieCatalogService {
  private readonly tmdbService = inject(TmdbService);

  getGenres(): Observable<CatalogGenre[]> {
    return this.tmdbService
      .get<TmdbGenreResponse>('/genre/movie/list')
      .pipe(map((response) => response.genres));
  }

  getMovies(filters: CatalogFilters): Observable<CatalogPage> {
    const isSearch = Boolean(filters.query.trim());
    let params = new HttpParams().set('page', String(filters.page));

    if (isSearch) {
      params = params.set('query', filters.query.trim());
      if (filters.year) {
        params = params.set('year', filters.year);
      }
    } else {
      if (filters.genreId) {
        params = params.set('with_genres', filters.genreId);
      }
      if (filters.year) {
        params = params.set('primary_release_year', filters.year);
      }
      if (filters.minimumRating) {
        params = params.set('vote_average.gte', filters.minimumRating);
      }
      params = params.set('sort_by', filters.sortBy);
    }

    const endpoint = isSearch ? '/search/movie' : '/discover/movie';
    return this.tmdbService
      .get<TmdbResponse<TmdbResult>>(endpoint, params)
      .pipe(map((response) => this.toMoviePage(response, filters, isSearch)));
  }

  private toMoviePage(
    response: TmdbResponse<TmdbResult>,
    filters: CatalogFilters,
    isSearch: boolean,
  ): CatalogPage {
    let results = response.results.map((result) => this.tmdbService.toMediaItem(result, 'movie'));

    if (isSearch) {
      if (filters.genreId) {
        const genreId = Number(filters.genreId);
        results = results.filter((movie) =>
          response.results.find((result) => result.id === movie.id)?.genre_ids?.includes(genreId),
        );
      }
      if (filters.minimumRating) {
        const minimumRating = Number(filters.minimumRating);
        results = results.filter((movie) => movie.voteAverage >= minimumRating);
      }
      results = this.sortMovies(results, filters.sortBy);
    }

    return {
      results,
      page: response.page ?? filters.page,
      totalPages: response.total_pages ?? 1,
      totalResults: response.total_results ?? results.length,
    };
  }

  private sortMovies(movies: TmdbItem[], sortBy: string): TmdbItem[] {
    const sortedMovies = [...movies];
    if (sortBy === 'vote_average.desc') {
      return sortedMovies.sort((left, right) => right.voteAverage - left.voteAverage);
    }
    if (sortBy === 'primary_release_date.desc') {
      return sortedMovies.sort((left, right) => right.releaseDate.localeCompare(left.releaseDate));
    }
    return sortedMovies.sort((left, right) => (right.popularity ?? 0) - (left.popularity ?? 0));
  }
}
