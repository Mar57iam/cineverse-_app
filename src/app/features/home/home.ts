import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideArrowUpRight,
  LucideCheck,
  LucidePlus,
  LucideSparkles,
  LucideStar,
} from '@lucide/angular';
import { HomePageData, TmdbItem } from '../../core/models/tmdb.model';
import { MovieService } from '../../core/services/movie.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { Footer } from '../../shared/components/footer/footer';
import { MediaSection } from '../../shared/components/media-section/media-section';

@Component({
  imports: [DecimalPipe, Footer, LucideArrowUpRight, LucideCheck, LucidePlus, LucideSparkles, LucideStar, MediaSection],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  readonly movieService = inject(MovieService);
  readonly tmdbService = inject(TmdbService);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly homeData = signal<HomePageData | null>(null);
  readonly savedMovieIds = signal<string[]>([]);
  readonly trendingSection = viewChild<ElementRef<HTMLElement>>('trendingSection');
  readonly featuredMovie = computed(() => this.homeData()?.trending[0] ?? null);
  readonly featuredSaved = computed(() => {
    const featured = this.featuredMovie();
    return featured ? this.isSaved(featured) : false;
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadHomePageData();
  }

  loadHomePageData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.homeData.set(null);

    this.movieService
      .getHomePageData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.homeData.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('We couldn’t load the movies right now. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  toggleFeatured(): void {
    const featured = this.featuredMovie();
    if (featured) {
      this.toggleMovie(featured);
    }
  }

  toggleMovie(movie: TmdbItem): void {
    const key = this.getMovieKey(movie);
    this.savedMovieIds.update((saved) =>
      saved.includes(key) ? saved.filter((movieKey) => movieKey !== key) : [...saved, key],
    );
  }

  isSaved(movie: TmdbItem): boolean {
    return this.savedMovieIds().includes(this.getMovieKey(movie));
  }

  getYear(date: string): string {
    return date.slice(0, 4) || '—';
  }

  scrollToMovies(): void {
    this.trendingSection()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private getMovieKey(movie: TmdbItem): string {
    return `${movie.mediaType}:${movie.id}`;
  }
}
