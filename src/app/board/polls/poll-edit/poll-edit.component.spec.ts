import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollEditComponent } from './poll-edit.component';

describe('PollEditComponent', () => {
  let component: PollEditComponent;
  let fixture: ComponentFixture<PollEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
