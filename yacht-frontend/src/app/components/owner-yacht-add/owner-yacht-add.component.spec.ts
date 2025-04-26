import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerYachtAddComponent } from './owner-yacht-add.component';

describe('OwnerYachtAddComponent', () => {
  let component: OwnerYachtAddComponent;
  let fixture: ComponentFixture<OwnerYachtAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerYachtAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerYachtAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
