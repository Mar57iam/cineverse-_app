import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { HomePageData, MediaType, TmdbItem, TmdbResponse, TmdbResult } from '../models/tmdb.model';
import { TmdbService } from './tmdb.service';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly tmdbService = inject(TmdbService);

  getHomePageData(): Observable<HomePageData> {
    return forkJoin({
      trending: this.getCollection('/trending/movie/week', 'movie'),
      popular: this.getCollection('/movie/popular', 'movie'),
      topRated: this.getCollection('/movie/top_rated', 'movie'),
      upcoming: this.getCollection('/movie/upcoming', 'movie'),
      popularTv: this.getCollection('/tv/popular', 'tv'),
    });
  }

  private getCollection(endpoint: string, mediaType: MediaType): Observable<TmdbItem[]> {
    return this.tmdbService
      .get<TmdbResponse<TmdbResult>>(endpoint, new HttpParams().set('page', '1'))
      .pipe(map((response) => response.results.map((result) => this.tmdbService.toMediaItem(result, mediaType))));
  }
}
