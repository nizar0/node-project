import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YachtListComponent } from './yacht-list.component';

describe('OwnerYachtListComponent', () => {
  let component: YachtListComponent;
  let fixture: ComponentFixture<YachtListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YachtListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YachtListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
