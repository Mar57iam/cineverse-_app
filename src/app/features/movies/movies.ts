import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideArrowLeft, LucideArrowRight, LucideRotateCcw } from '@lucide/angular';
import { Subject, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import { CatalogFilters, CatalogGenre, CatalogPage, TmdbItem } from '../../core/models/tmdb.model';
import { MovieCatalogService } from '../../core/services/movie-catalog.service';
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
  selector: 'app-movies',
  styleUrl: '../../shared/styles/catalog-page.css',
  templateUrl: './movies.html',
})
export class Movies {
  private readonly movieCatalogService = inject(MovieCatalogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieRequests = new Subject<CatalogFilters>();

  readonly genres = signal<CatalogGenre[]>([]);
  readonly movies = signal<TmdbItem[]>([]);
  readonly isLoading = signal(true);
  readonly isLoadingGenres = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly genreErrorMessage = signal<string | null>(null);
  readonly totalResults = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly savedMovieIds = signal<string[]>([]);
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
    this.movieRequests
      .pipe(
        switchMap((filters) => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.movieCatalogService.getMovies(filters).pipe(
            catchError(() => {
              this.errorMessage.set('We couldn’t load the movies right now. Please try again.');
              return of(null);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response: CatalogPage | null) => {
        if (response) {
          this.movies.set(response.results);
          this.totalResults.set(response.totalResults);
          this.totalPages.set(Math.min(response.totalPages, 500));
        }
      });

    this.filters.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadMovies(1));

    this.movieCatalogService
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

    this.loadMovies(1);
  }

  loadMovies(page: number): void {
    this.currentPage.set(page);
    this.movieRequests.next({
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

  toggleMovie(movie: TmdbItem): void {
    const key = `${movie.mediaType}:${movie.id}`;
    this.savedMovieIds.update((saved) =>
      saved.includes(key) ? saved.filter((movieKey) => movieKey !== key) : [...saved, key],
    );
  }

  isSaved(movie: TmdbItem): boolean {
    return this.savedMovieIds().includes(`${movie.mediaType}:${movie.id}`);
  }
}
