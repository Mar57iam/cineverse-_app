import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MediaType, TmdbItem, TmdbResult } from '../models/tmdb.model';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private readonly http = inject(HttpClient);

  get<T>(endpoint: string, params = new HttpParams()): Observable<T> {
    const requestParams = params.set('api_key', environment.apiKey).set('language', 'en-US');
    return this.http.get<T>(`${environment.baseUrl}${endpoint}`, { params: requestParams });
  }

  getImageUrl(path: string | null, size: 'w500' | 'w780' | 'original' = 'w500'): string | null {
    return path ? `${environment.imageBaseUrl}/${size}${path}` : null;
  }

  toMediaItem(result: TmdbResult, mediaType: MediaType): TmdbItem {
    return {
      id: result.id,
      title: result.title ?? result.name ?? 'Untitled',
      overview: result.overview ?? '',
      posterPath: result.poster_path,
      backdropPath: result.backdrop_path,
      voteAverage: result.vote_average,
      ...(result.popularity !== undefined ? { popularity: result.popularity } : {}),
      releaseDate: result.release_date ?? result.first_air_date ?? '',
      mediaType,
    };
  }
}
