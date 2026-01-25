import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrikaComponent } from './matrika.component';

describe('MatrikaComponent', () => {
  let component: MatrikaComponent;
  let fixture: ComponentFixture<MatrikaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrikaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrikaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
