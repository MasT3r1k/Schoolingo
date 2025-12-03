import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMidtermComponent } from './edit-midterm.component';

describe('EditMidtermComponent', () => {
  let component: EditMidtermComponent;
  let fixture: ComponentFixture<EditMidtermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMidtermComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMidtermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
