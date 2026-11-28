import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  let service: TmdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(TmdbService);
  });

  it('builds image URLs only when a path exists', () => {
    expect(service.getImageUrl('/poster.jpg')).toBe(`${environment.imageBaseUrl}/w500/poster.jpg`);
    expect(service.getImageUrl(null)).toBeNull();
  });
});
