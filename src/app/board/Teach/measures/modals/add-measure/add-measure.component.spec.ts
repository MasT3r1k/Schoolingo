import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMeasureComponent } from './add-measure.component';

describe('AddMeasureComponent', () => {
  let component: AddMeasureComponent;
  let fixture: ComponentFixture<AddMeasureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMeasureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMeasureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
