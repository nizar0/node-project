import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminYachtManagementComponent } from './admin-yacht-management.component';

describe('AdminYachtManagementComponent', () => {
  let component: AdminYachtManagementComponent;
  let fixture: ComponentFixture<AdminYachtManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminYachtManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminYachtManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
