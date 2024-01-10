import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagebooksComponent } from './managebooks.component';

describe('ManagebooksComponent', () => {
  let component: ManagebooksComponent;
  let fixture: ComponentFixture<ManagebooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagebooksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagebooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
