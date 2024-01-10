import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassbookComponent } from './classbook.component';

describe('ClassbookComponent', () => {
  let component: ClassbookComponent;
  let fixture: ComponentFixture<ClassbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassbookComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
