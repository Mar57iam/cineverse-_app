import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, computed, inject, input, output, viewChild } from '@angular/core';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideCheck,
  LucidePlus,
  LucideStar,
} from '@lucide/angular';
import { TmdbItem } from '../../../core/models/tmdb.model';
import { MovieService } from '../../../core/services/movie.service';

@Component({
  imports: [DecimalPipe, LucideArrowLeft, LucideArrowRight, LucideCheck, LucidePlus, LucideStar],
  selector: 'app-media-section',
  styleUrl: './media-section.css',
  templateUrl: './media-section.html',
})
export class MediaSection {
  readonly sectionId = input.required<string>();
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly items = input.required<TmdbItem[]>();
  readonly savedMovieIds = input.required<string[]>();
  readonly movieToggled = output<TmdbItem>();
  readonly movieService = inject(MovieService);
  readonly hasMoreItems = computed(() => this.items().length > 4);
  readonly slider = viewChild<ElementRef<HTMLElement>>('slider');

  isSaved(movie: TmdbItem): boolean {
    return this.savedMovieIds().includes(`${movie.mediaType}:${movie.id}`);
  }

  toggleSaved(movie: TmdbItem): void {
    this.movieToggled.emit(movie);
  }

  scroll(direction: -1 | 1): void {
    const slider = this.slider()?.nativeElement;
    if (slider) {
      slider.scrollBy({ left: direction * slider.clientWidth * 0.8, behavior: 'smooth' });
    }
  }
}
