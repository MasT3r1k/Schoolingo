import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTFAComponent } from './add-tfa.component';

describe('AddTFAComponent', () => {
  let component: AddTFAComponent;
  let fixture: ComponentFixture<AddTFAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTFAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTFAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
