import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideStar } from '@lucide/angular';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { TvShowDetails } from '../../core/models/tmdb.model';
import { TmdbService } from '../../core/services/tmdb.service';
import { TvCatalogService } from '../../core/services/tv-catalog.service';

@Component({
  imports: [DecimalPipe, LucideArrowLeft, LucideStar, RouterLink],
  selector: 'app-tv-details',
  styleUrl: './tv-details.css',
  templateUrl: './tv-details.html',
})
export class TvDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly tvCatalogService = inject(TvCatalogService);
  private readonly tmdbService = inject(TmdbService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tvShow = signal<TvShowDetails | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.errorMessage.set('This TV show could not be found.');
            this.isLoading.set(false);
            return of(null);
          }

          this.isLoading.set(true);
          this.errorMessage.set(null);
          return this.tvCatalogService.getDetails(id).pipe(
            catchError(() => {
              this.errorMessage.set('We couldn’t load this TV show. Please try again.');
              return of(null);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((show) => this.tvShow.set(show));
  }
}
