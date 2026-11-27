import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-tv-details',
  templateUrl: './tv-details.html',
})
export class TvDetails {
  private readonly route = inject(ActivatedRoute);
  readonly tvShowId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: null,
  });
}
