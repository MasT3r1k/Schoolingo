import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PupilcardComponent } from './pupilcard.component';

describe('PupilcardComponent', () => {
  let component: PupilcardComponent;
  let fixture: ComponentFixture<PupilcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PupilcardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PupilcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
