import { TestBed } from '@angular/core/testing';

import { AnniversaryService } from './anniversary.service';

describe('AnniversaryService', () => {
  let service: AnniversaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnniversaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
