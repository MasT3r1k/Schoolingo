import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalMeasuresComponent } from './educational-measures.component';

describe('EducationalMeasuresComponent', () => {
  let component: EducationalMeasuresComponent;
  let fixture: ComponentFixture<EducationalMeasuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationalMeasuresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationalMeasuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
