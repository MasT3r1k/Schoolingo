import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeworkDetailsComponent } from './homework-details.component';

describe('HomeworkDetailsComponent', () => {
  let component: HomeworkDetailsComponent;
  let fixture: ComponentFixture<HomeworkDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeworkDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeworkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
