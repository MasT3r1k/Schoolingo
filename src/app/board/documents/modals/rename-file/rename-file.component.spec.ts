import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameFileComponent } from './rename-file.component';

describe('RenameFileComponent', () => {
  let component: RenameFileComponent;
  let fixture: ComponentFixture<RenameFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenameFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenameFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
