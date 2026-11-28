import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CatalogPage } from '../models/tmdb.model';
import { MovieCatalogService } from './movie-catalog.service';

describe('MovieCatalogService', () => {
  let service: MovieCatalogService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieCatalogService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads movie genres', () => {
    let genres: { id: number; name: string }[] | undefined;
    service.getGenres().subscribe((response) => (genres = response));

    const request = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/genre/movie/list`,
    );
    expect(request.request.params.get('language')).toBe('en-US');
    request.flush({ genres: [{ id: 28, name: 'Action' }] });

    expect(genres).toEqual([{ id: 28, name: 'Action' }]);
  });

  it('discovers movies using selected filters and maps pagination metadata', () => {
    let response: CatalogPage | undefined;
    service
      .getMovies({
        query: '',
        genreId: '28',
        year: '2024',
        minimumRating: '7',
        sortBy: 'vote_average.desc',
        page: 3,
      })
      .subscribe((data) => (response = data));

    const request = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/discover/movie`,
    );
    expect(request.request.params.get('with_genres')).toBe('28');
    expect(request.request.params.get('primary_release_year')).toBe('2024');
    expect(request.request.params.get('vote_average.gte')).toBe('7');
    expect(request.request.params.get('sort_by')).toBe('vote_average.desc');
    expect(request.request.params.get('page')).toBe('3');
    request.flush({
      page: 3,
      total_pages: 8,
      total_results: 152,
      results: [
        {
          id: 42,
          title: 'Filtered movie',
          overview: 'A plot.',
          poster_path: '/poster.jpg',
          backdrop_path: null,
          vote_average: 8.2,
          release_date: '2024-06-10',
        },
      ],
    });

    expect(response).toMatchObject({
      page: 3,
      totalPages: 8,
      totalResults: 152,
      results: [{ id: 42, title: 'Filtered movie', mediaType: 'movie' }],
    });
  });

  it('searches movie titles and applies genre, rating, and sort filters', () => {
    let response: CatalogPage | undefined;
    service
      .getMovies({
        query: 'space',
        genreId: '28',
        year: '',
        minimumRating: '7',
        sortBy: 'vote_average.desc',
        page: 1,
      })
      .subscribe((data) => (response = data));

    const request = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/search/movie`,
    );
    expect(request.request.params.get('query')).toBe('space');
    request.flush({
      page: 1,
      total_pages: 1,
      total_results: 3,
      results: [
        {
          id: 1,
          title: 'Lower rated',
          poster_path: null,
          backdrop_path: null,
          vote_average: 6,
          popularity: 30,
          genre_ids: [28],
        },
        {
          id: 2,
          title: 'Higher rated',
          poster_path: null,
          backdrop_path: null,
          vote_average: 8,
          popularity: 10,
          genre_ids: [28],
        },
        {
          id: 3,
          title: 'Different genre',
          poster_path: null,
          backdrop_path: null,
          vote_average: 9,
          genre_ids: [35],
        },
      ],
    });

    expect(response?.results.map((movie) => movie.id)).toEqual([2]);
  });
});
