import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolSettingsComponent } from './school-settings.component';

describe('SchoolSettingsComponent', () => {
  let component: SchoolSettingsComponent;
  let fixture: ComponentFixture<SchoolSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchoolSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
