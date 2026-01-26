import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateSubjectComponent } from './template-subject.component';

describe('TemplateSubjectComponent', () => {
  let component: TemplateSubjectComponent;
  let fixture: ComponentFixture<TemplateSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateSubjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
