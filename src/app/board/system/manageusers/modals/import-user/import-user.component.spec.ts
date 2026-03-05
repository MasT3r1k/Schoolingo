import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserComponent } from './import-user.component';

describe('ImportUserComponent', () => {
  let component: ImportUserComponent;
  let fixture: ComponentFixture<ImportUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
