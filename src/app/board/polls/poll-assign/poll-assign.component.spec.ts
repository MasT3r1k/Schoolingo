import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollAssignComponent } from './poll-assign.component';

describe('PollAssignComponent', () => {
  let component: PollAssignComponent;
  let fixture: ComponentFixture<PollAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollAssignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
