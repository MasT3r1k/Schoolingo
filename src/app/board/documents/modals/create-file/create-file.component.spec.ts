import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFileComponent } from './create-file.component';

describe('CreateFileComponent', () => {
  let component: CreateFileComponent;
  let fixture: ComponentFixture<CreateFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
