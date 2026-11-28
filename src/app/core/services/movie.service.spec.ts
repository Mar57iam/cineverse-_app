import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { HomePageData } from '../models/tmdb.model';
import { MovieService } from './movie.service';

describe('MovieService', () => {
  let service: MovieService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads the five home collections and maps trending movie data', () => {
    let response: HomePageData | undefined;
    service.getHomePageData().subscribe((data) => (response = data));

    const requests = httpTestingController.match((request) => request.method === 'GET');
    expect(requests.map(({ request }) => request.url.replace(environment.baseUrl, ''))).toEqual([
      '/trending/movie/week',
      '/movie/popular',
      '/movie/top_rated',
      '/movie/upcoming',
      '/tv/popular',
    ]);

    for (const testRequest of requests) {
      const { request } = testRequest;
      expect(request.params.get('language')).toBe('en-US');
      expect(request.params.has('api_key')).toBe(true);

      testRequest.flush({
        results:
          request.url.endsWith('/trending/movie/week')
            ? [
                {
                  id: 7,
                  title: 'Featured film',
                  overview: 'A story.',
                  poster_path: '/poster.jpg',
                  backdrop_path: '/backdrop.jpg',
                  vote_average: 8.4,
                  release_date: '2026-02-03',
                },
              ]
            : request.url.endsWith('/tv/popular')
              ? [
                  {
                    id: 12,
                    name: 'Featured series',
                    overview: 'A series.',
                    poster_path: '/series-poster.jpg',
                    backdrop_path: null,
                    vote_average: 8.1,
                    first_air_date: '2025-11-04',
                  },
                ]
            : [],
      });
    }

    expect(response?.trending[0]).toEqual({
      id: 7,
      title: 'Featured film',
      overview: 'A story.',
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg',
      voteAverage: 8.4,
      releaseDate: '2026-02-03',
      mediaType: 'movie',
    });
    expect(response?.popularTv[0]).toEqual({
      id: 12,
      title: 'Featured series',
      overview: 'A series.',
      posterPath: '/series-poster.jpg',
      backdropPath: null,
      voteAverage: 8.1,
      releaseDate: '2025-11-04',
      mediaType: 'tv',
    });
  });

});
