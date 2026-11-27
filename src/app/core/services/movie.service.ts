import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomePageData, MediaType, TmdbItem, TmdbResponse, TmdbResult } from '../models/tmdb.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly http = inject(HttpClient);

  getHomePageData(): Observable<HomePageData> {
    return forkJoin({
      trending: this.getCollection('/trending/movie/week', 'movie'),
      popular: this.getCollection('/movie/popular', 'movie'),
      topRated: this.getCollection('/movie/top_rated', 'movie'),
      upcoming: this.getCollection('/movie/upcoming', 'movie'),
      popularTv: this.getCollection('/tv/popular', 'tv'),
    });
  }

  getImageUrl(path: string | null, size: 'w500' | 'w780' | 'original' = 'w500'): string | null {
    return path ? `${environment.imageBaseUrl}/${size}${path}` : null;
  }

  private getCollection(endpoint: string, mediaType: MediaType): Observable<TmdbItem[]> {
    const params = new HttpParams()
      .set('api_key', environment.apiKey)
      .set('language', 'en-US')
      .set('page', '1');

    return this.http
      .get<TmdbResponse<TmdbResult>>(`${environment.baseUrl}${endpoint}`, { params })
      .pipe(map((response) => response.results.map((result) => this.toMediaItem(result, mediaType))));
  }

  private toMediaItem(result: TmdbResult, mediaType: MediaType): TmdbItem {
    return {
      id: result.id,
      title: result.title ?? result.name ?? 'Untitled',
      overview: result.overview ?? '',
      posterPath: result.poster_path,
      backdropPath: result.backdrop_path,
      voteAverage: result.vote_average,
      releaseDate: result.release_date ?? result.first_air_date ?? '',
      mediaType,
    };
  }
}
