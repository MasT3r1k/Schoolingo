import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionplanComponent } from './actionplan.component';

describe('ActionplanComponent', () => {
  let component: ActionplanComponent;
  let fixture: ComponentFixture<ActionplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionplanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActionplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
