import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalDashboardComponent } from './local-dashboard.component';

describe('LocalDashboardComponent', () => {
  let component: LocalDashboardComponent;
  let fixture: ComponentFixture<LocalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocalDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
