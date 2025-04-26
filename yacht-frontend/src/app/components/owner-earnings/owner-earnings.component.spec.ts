import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerEarningsComponent } from './owner-earnings.component';

describe('OwnerEarningsComponent', () => {
  let component: OwnerEarningsComponent;
  let fixture: ComponentFixture<OwnerEarningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerEarningsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerEarningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
