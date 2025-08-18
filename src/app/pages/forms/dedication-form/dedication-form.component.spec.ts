import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DedicationFormComponent } from './dedication-form.component';

describe('DedicationFormComponent', () => {
  let component: DedicationFormComponent;
  let fixture: ComponentFixture<DedicationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DedicationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DedicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
