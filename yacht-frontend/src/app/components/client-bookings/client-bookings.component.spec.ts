import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBookingsComponent } from './client-bookings.component';

describe('ClientBookingsComponent', () => {
  let component: ClientBookingsComponent;
  let fixture: ComponentFixture<ClientBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientBookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
