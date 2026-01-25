import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagefilesComponent } from './managefiles.component';

describe('ManagefilesComponent', () => {
  let component: ManagefilesComponent;
  let fixture: ComponentFixture<ManagefilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagefilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagefilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
