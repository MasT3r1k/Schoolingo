import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntermRecordComponent } from './interm-record.component';

describe('IntermRecordComponent', () => {
  let component: IntermRecordComponent;
  let fixture: ComponentFixture<IntermRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntermRecordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IntermRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
