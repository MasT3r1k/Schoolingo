import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectReceiverComponent } from './select-receiver.component';

describe('SelectReceiverComponent', () => {
  let component: SelectReceiverComponent;
  let fixture: ComponentFixture<SelectReceiverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectReceiverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectReceiverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
