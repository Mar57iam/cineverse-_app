import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideArrowLeft, LucideArrowRight, LucideRotateCcw } from '@lucide/angular';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import { CatalogFilters, CatalogGenre, CatalogPage, TmdbItem } from '../../core/models/tmdb.model';
import { TvCatalogService } from '../../core/services/tv-catalog.service';
import { Footer } from '../../shared/components/footer/footer';
import { MovieCard } from '../../shared/components/movie-card/movie-card';

@Component({
  imports: [
    DecimalPipe,
    Footer,
    LucideArrowLeft,
    LucideArrowRight,
    LucideRotateCcw,
    MovieCard,
    ReactiveFormsModule,
  ],
  selector: 'app-tv-shows',
  styleUrl: '../../shared/styles/catalog-page.css',
  templateUrl: './tv-shows.html',
})
export class TvShows {
  private readonly tvCatalogService = inject(TvCatalogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tvShowRequests = new Subject<CatalogFilters>();

  readonly genres = signal<CatalogGenre[]>([]);
  readonly tvShows = signal<TmdbItem[]>([]);
  readonly isLoading = signal(true);
  readonly isLoadingGenres = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly genreErrorMessage = signal<string | null>(null);
  readonly totalResults = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly savedTvShowIds = signal<string[]>([]);
  readonly pageNumbers = computed(() => {
    const lastPage = this.totalPages();
    const firstPage = Math.max(1, Math.min(this.currentPage() - 2, lastPage - 4));
    return Array.from({ length: Math.min(5, lastPage) }, (_, index) => firstPage + index);
  });
  readonly years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, index) =>
    String(new Date().getFullYear() - index),
  );
  readonly filters = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    genreId: new FormControl('', { nonNullable: true }),
    year: new FormControl('', { nonNullable: true }),
    minimumRating: new FormControl('', { nonNullable: true }),
    sortBy: new FormControl('popularity.desc', { nonNullable: true }),
  });

  constructor() {
    this.tvShowRequests
      .pipe(
        switchMap((filters) => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.tvCatalogService.getTvShows(filters).pipe(
            catchError(() => {
              this.errorMessage.set('We couldn’t load the TV shows right now. Please try again.');
              return of(null);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response: CatalogPage | null) => {
        if (response) {
          this.tvShows.set(response.results);
          this.totalResults.set(response.totalResults);
          this.totalPages.set(Math.min(response.totalPages, 500));
        }
      });

    this.filters.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTvShows(1));

    this.tvCatalogService
      .getGenres()
      .pipe(
        catchError(() => {
          this.genreErrorMessage.set('Genres are temporarily unavailable.');
          return of([]);
        }),
        finalize(() => this.isLoadingGenres.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((genres) => this.genres.set(genres));

    this.loadTvShows(1);
  }

  loadTvShows(page: number): void {
    this.currentPage.set(page);
    this.tvShowRequests.next({
      ...this.filters.getRawValue(),
      page,
    });
  }

  clearFilters(): void {
    this.filters.reset({
      query: '',
      genreId: '',
      year: '',
      minimumRating: '',
      sortBy: 'popularity.desc',
    });
  }

  toggleTvShow(tvShow: TmdbItem): void {
    const key = `${tvShow.mediaType}:${tvShow.id}`;
    this.savedTvShowIds.update((saved) =>
      saved.includes(key) ? saved.filter((showKey) => showKey !== key) : [...saved, key],
    );
  }

  isSaved(tvShow: TmdbItem): boolean {
    return this.savedTvShowIds().includes(`${tvShow.mediaType}:${tvShow.id}`);
  }
}
