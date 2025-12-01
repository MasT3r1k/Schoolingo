import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupCodesComponent } from './backup-codes.component';

describe('BackupCodesComponent', () => {
  let component: BackupCodesComponent;
  let fixture: ComponentFixture<BackupCodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackupCodesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
