import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordManageUsersComponent } from './reset-password.component';

describe('ResetPasswordManageUsersComponent', () => {
  let component: ResetPasswordManageUsersComponent;
  let fixture: ComponentFixture<ResetPasswordManageUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordManageUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordManageUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
