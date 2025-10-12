import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceComponent } from './absence.component';

describe('AbsenceComponent', () => {
  let component: AbsenceComponent;
  let fixture: ComponentFixture<AbsenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
