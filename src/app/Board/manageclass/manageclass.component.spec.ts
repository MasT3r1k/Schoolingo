import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageclassComponent } from './manageclass.component';

describe('ManageclassComponent', () => {
  let component: ManageclassComponent;
  let fixture: ComponentFixture<ManageclassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageclassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
