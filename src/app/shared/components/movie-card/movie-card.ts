import { DecimalPipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCheck, LucidePlus, LucideStar } from '@lucide/angular';
import { TmdbItem } from '../../../core/models/tmdb.model';
import { TmdbService } from '../../../core/services/tmdb.service';

@Component({
  imports: [DecimalPipe, LucideCheck, LucidePlus, LucideStar, RouterLink],
  selector: 'app-movie-card',
  styleUrl: './movie-card.css',
  templateUrl: './movie-card.html',
})
export class MovieCard {
  readonly movie = input.required<TmdbItem>();
  readonly saved = input(false);
  readonly rank = input<number | null>(null);
  readonly watchlistToggled = output<TmdbItem>();
  readonly tmdbService = inject(TmdbService);

  toggleSaved(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.watchlistToggled.emit(this.movie());
  }
}
