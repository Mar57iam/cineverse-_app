import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideBookmark,
  LucideClapperboard,
  LucideHouse,
  LucideMenu,
  LucideSearch,
  LucideTv,
  LucideUserRound,
  LucideX,
} from '@lucide/angular';

@Component({
  imports: [
    LucideBookmark,
    LucideClapperboard,
    LucideHouse,
    LucideMenu,
    LucideSearch,
    LucideTv,
    LucideUserRound,
    LucideX,
    RouterLink,
    RouterLinkActive,
  ],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);
  readonly searchOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    if (this.menuOpen()) {
      this.searchOpen.set(false);
    }
  }

  toggleSearch(): void {
    this.searchOpen.update((open) => !open);
    if (this.searchOpen()) {
      this.menuOpen.set(false);
    }
  }

  closePanels(): void {
    this.menuOpen.set(false);
    this.searchOpen.set(false);
  }

  navigateToSearch(query: string): void {
    const searchTerm = query.trim();
    this.closePanels();
    this.router.navigate(['/search'], {
      queryParams: searchTerm ? { q: searchTerm } : {},
    });
  }
}
