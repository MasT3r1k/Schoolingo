import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemErrorComponent } from './system-error.component';

describe('SystemErrorComponent', () => {
  let component: SystemErrorComponent;
  let fixture: ComponentFixture<SystemErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
