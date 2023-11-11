import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidtermComponent } from './midterm.component';

describe('MidtermComponent', () => {
  let component: MidtermComponent;
  let fixture: ComponentFixture<MidtermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MidtermComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MidtermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
