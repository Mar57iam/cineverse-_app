import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Home | Cineverse',
    loadComponent: () => import('./features/home/home').then((module) => module.Home),
  },
  {
    path: 'movies',
    title: 'Movies | Cineverse',
    loadComponent: () => import('./features/movies/movies').then((module) => module.Movies),
  },
  {
    path: 'movies/:id',
    title: 'Movie Details | Cineverse',
    loadComponent: () => import('./features/movie-details/movie-details').then((module) => module.MovieDetails),
  },
  {
    path: 'tv-shows',
    title: 'TV Shows | Cineverse',
    loadComponent: () => import('./features/tv-shows/tv-shows').then((module) => module.TvShows),
  },
  {
    path: 'tv-shows/:id',
    title: 'TV Details | Cineverse',
    loadComponent: () => import('./features/tv-details/tv-details').then((module) => module.TvDetails),
  },
  {
    path: 'search',
    title: 'Search | Cineverse',
    loadComponent: () => import('./features/search/search').then((module) => module.Search),
  },
  {
    path: 'watchlist',
    title: 'Watchlist | Cineverse',
    loadComponent: () => import('./features/watchlist/watchlist').then((module) => module.Watchlist),
  },
  { path: '**', redirectTo: 'home' },
];
