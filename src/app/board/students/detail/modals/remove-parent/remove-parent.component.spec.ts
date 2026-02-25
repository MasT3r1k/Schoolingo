import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveParentComponent } from './remove-parent.component';

describe('RemoveParentComponent', () => {
  let component: RemoveParentComponent;
  let fixture: ComponentFixture<RemoveParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveParentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
