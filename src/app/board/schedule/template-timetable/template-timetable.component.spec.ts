import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateTimetableComponent } from './template-timetable.component';

describe('TemplateTimetableComponent', () => {
  let component: TemplateTimetableComponent;
  let fixture: ComponentFixture<TemplateTimetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateTimetableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateTimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
