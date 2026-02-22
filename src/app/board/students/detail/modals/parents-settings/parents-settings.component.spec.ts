import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentsSettingsComponent } from './parents-settings.component';

describe('ParentsSettingsComponent', () => {
  let component: ParentsSettingsComponent;
  let fixture: ComponentFixture<ParentsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentsSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
