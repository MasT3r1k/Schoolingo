import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifiesComponent } from './notifies.component';

describe('NotifiesComponent', () => {
  let component: NotifiesComponent;
  let fixture: ComponentFixture<NotifiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotifiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotifiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
