import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { HomePageData } from './core/models/tmdb.model';
import { MovieService } from './core/services/movie.service';

const homePageData: HomePageData = {
  trending: [
    {
      id: 1,
      title: 'Featured title',
      overview: 'A featured story.',
      posterPath: null,
      backdropPath: null,
      voteAverage: 8.5,
      releaseDate: '2026-01-01',
      mediaType: 'movie',
    },
  ],
  popular: [],
  topRated: [],
  upcoming: [],
  popularTv: [],
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        {
          provide: MovieService,
          useValue: {
            getHomePageData: () => of(homePageData),
            getImageUrl: () => null,
          },
        },
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the featured movie from the home data', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-home h1')?.textContent).toContain('Featured title');
  });
});
