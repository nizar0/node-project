import { TestBed } from '@angular/core/testing';

import { YachtService } from './yacht.service';

describe('YachtService', () => {
  let service: YachtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YachtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
