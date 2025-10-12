import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedComponent } from './received.component';

describe('ReceivedComponent', () => {
  let component: ReceivedComponent;
  let fixture: ComponentFixture<ReceivedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
