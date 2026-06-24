import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRegularPaymentComponent } from './new-regular-payment.component';

describe('NewRegularPaymentComponent', () => {
  let component: NewRegularPaymentComponent;
  let fixture: ComponentFixture<NewRegularPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRegularPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewRegularPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
