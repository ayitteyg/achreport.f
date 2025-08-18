import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ActivityFormsComponent } from './pages/forms/activity-forms/activity-forms.component';
import { ConfirmdialogComponent } from './components/confirmdialog/confirmdialog.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaptismFormComponent } from './pages/forms/baptism-form/baptism-form.component';
import { TransferFormComponent } from './pages/forms/transfer-form/transfer-form.component';
import { AttendanceFormComponent } from './pages/forms/attendance-form/attendance-form.component';
import { VisitorFormComponent } from './pages/forms/visitor-form/visitor-form.component';
import { DedicationFormComponent } from './pages/forms/dedication-form/dedication-form.component';
import { EventFormComponent } from './pages/forms/event-form/event-form.component';
import { TreasuryFormComponent } from './pages/forms/treasury-form/treasury-form.component';
import { DistDashboardComponent } from './pages/dist-dashboard/dist-dashboard.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { LocalDashboardComponent } from './pages/local-dashboard/local-dashboard.component';
import { ReportPageComponent } from './pages/report-page/report-page.component';



// Define config outside NgModule
const circleProgressConfig = NgCircleProgressModule.forRoot({
  radius: 50,
  outerStrokeWidth: 2,
  innerStrokeWidth: 4,
  outerStrokeColor: '#78C000',
  innerStrokeColor: '#C7E596',
  animationDuration: 300,
  showSubtitle: false,
  showUnits: true,
  // units: '%',
  startFromZero: false
});


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomepageComponent,
    LandingPageComponent,
    ActivityFormsComponent,
    ConfirmdialogComponent,
    BaptismFormComponent,
    TransferFormComponent,
    AttendanceFormComponent,
    VisitorFormComponent,
    DedicationFormComponent,
    EventFormComponent,
    TreasuryFormComponent,
    DistDashboardComponent,
    LocalDashboardComponent,
    ReportPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
     HttpClientModule,
    ReactiveFormsModule,  // Required for forms
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormField,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    NgxMatSelectSearchModule,
    DatePipe,

    circleProgressConfig, 
    




  
  ],
   providers: [ { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
