import { TestBed } from '@angular/core/testing';

import { DinoStatusService } from './dino-status.service';

describe('DinoStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DinoStatusService = TestBed.get(DinoStatusService);
    expect(service).toBeTruthy();
  });
});
