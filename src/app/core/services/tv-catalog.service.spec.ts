import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { TvCatalogService } from './tv-catalog.service';

describe('TvCatalogService', () => {
  let service: TvCatalogService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TvCatalogService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads TV genres', () => {
    let genres: { id: number; name: string }[] | undefined;
    service.getGenres().subscribe((response) => (genres = response));

    const request = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/genre/tv/list`,
    );
    request.flush({ genres: [{ id: 18, name: 'Drama' }] });

    expect(genres).toEqual([{ id: 18, name: 'Drama' }]);
  });

  it('loads popular shows by default', () => {
    service
      .getTvShows({
        query: '',
        genreId: '',
        year: '',
        minimumRating: '',
        sortBy: 'popularity.desc',
        page: 2,
      })
      .subscribe();

    const request = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/tv/popular`,
    );
    expect(request.request.params.get('page')).toBe('2');
    request.flush({ results: [] });
  });

  it('uses discover filters for genre, first air year, rating, and date sorting', () => {
    let response: { totalResults: number; results: { mediaType: string }[] } | undefined;
    service
      .getTvShows({
        query: '',
        genreId: '18',
        year: '2022',
        minimumRating: '7',
        sortBy: 'first_air_date.desc',
        page: 3,
      })
      .subscribe((data) => (response = data));

    const request = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/discover/tv`,
    );
    expect(request.request.params.get('with_genres')).toBe('18');
    expect(request.request.params.get('first_air_date_year')).toBe('2022');
    expect(request.request.params.get('vote_average.gte')).toBe('7');
    expect(request.request.params.get('sort_by')).toBe('first_air_date.desc');
    expect(request.request.params.get('page')).toBe('3');
    request.flush({
      page: 3,
      total_pages: 4,
      total_results: 70,
      results: [
        {
          id: 5,
          name: 'A series',
          overview: 'A story.',
          poster_path: '/series.jpg',
          backdrop_path: null,
          vote_average: 8.5,
          first_air_date: '2022-04-01',
        },
      ],
    });

    expect(response).toMatchObject({
      totalResults: 70,
      results: [{ title: 'A series', mediaType: 'tv', releaseDate: '2022-04-01' }],
    });
  });

  it('searches TV titles and loads the details endpoint', () => {
    service
      .getTvShows({
        query: 'space',
        genreId: '',
        year: '2023',
        minimumRating: '',
        sortBy: 'popularity.desc',
        page: 1,
      })
      .subscribe();

    const searchRequest = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/search/tv`,
    );
    expect(searchRequest.request.params.get('query')).toBe('space');
    expect(searchRequest.request.params.get('first_air_date_year')).toBe('2023');
    searchRequest.flush({ results: [] });

    let detailsName: string | undefined;
    service.getDetails('42').subscribe((details) => (detailsName = details.name));
    const detailsRequest = httpTestingController.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}/tv/42`,
    );
    detailsRequest.flush({ name: 'Space stories' });

    expect(detailsName).toBe('Space stories');
  });
});
