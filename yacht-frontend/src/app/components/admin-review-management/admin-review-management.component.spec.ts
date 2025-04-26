import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReviewManagementComponent } from './admin-review-management.component';

describe('AdminReviewManagementComponent', () => {
  let component: AdminReviewManagementComponent;
  let fixture: ComponentFixture<AdminReviewManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviewManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReviewManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
