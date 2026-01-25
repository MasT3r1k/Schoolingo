import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagemessagesComponent } from './managemessages.component';

describe('ManagemessagesComponent', () => {
  let component: ManagemessagesComponent;
  let fixture: ComponentFixture<ManagemessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagemessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagemessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
