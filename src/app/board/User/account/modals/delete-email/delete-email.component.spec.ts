import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEmailComponent } from './delete-email.component';

describe('DeleteEmailComponent', () => {
  let component: DeleteEmailComponent;
  let fixture: ComponentFixture<DeleteEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
