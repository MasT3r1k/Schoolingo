import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePasskeyComponent } from './update-passkey.component';

describe('UpdatePasskeyComponent', () => {
  let component: UpdatePasskeyComponent;
  let fixture: ComponentFixture<UpdatePasskeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePasskeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePasskeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
