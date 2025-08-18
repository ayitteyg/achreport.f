import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistDashboardComponent } from './dist-dashboard.component';

describe('DistDashboardComponent', () => {
  let component: DistDashboardComponent;
  let fixture: ComponentFixture<DistDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
