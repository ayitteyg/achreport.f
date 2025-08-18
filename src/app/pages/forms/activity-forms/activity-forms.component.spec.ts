import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityFormsComponent } from './activity-forms.component';

describe('ActivityFormsComponent', () => {
  let component: ActivityFormsComponent;
  let fixture: ComponentFixture<ActivityFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
