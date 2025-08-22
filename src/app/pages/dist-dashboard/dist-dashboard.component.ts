import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dist-dashboard',
  standalone: false,
  templateUrl: './dist-dashboard.component.html',
  styleUrl: './dist-dashboard.component.css'
})
export class DistDashboardComponent {


  // === DashboardComponent.ts ===

loading = false;

// --- Date Range ---
startDate!: string;
endDate!: string;
username!: any;
church!: string;
department!: string;

// --- Filter Selections ---
selectedService: string = 'Divine Service';        // Default service
selectedStatus: string = 'Adventist';              // For visitors
selectedQuarter: string = 'Q1';                    // Default quarter
selectedYear: string = new Date().getFullYear().toString(); // Optional: Use current year
selectedVisitorStatus: string = 'Adventist';       // For visitors
selectedEventType: string = 'Marriage';            // Default event type

// --- Reactive Form Setup (if needed) ---
filterForm = new FormGroup({
  selectedQuarter: new FormControl('Q1'),
  // Add other form controls here if you're using Reactive Forms
});

// --- Dropdown Lists ---
qtrList: string[] = ['Q1', 'Q2', 'Q3', 'Q4'];

serviceChoices = [
  { value: 'Mid-Week Service', label: 'Mid-Week Service' },
  { value: 'Bible Studies', label: 'Bible Studies' },
  { value: 'Sabbath School', label: 'Sabbath School' },
  { value: 'Divine Service', label: 'Divine Service' },
];

statusChoices = [
  { value: 'adventist', label: 'Adventist' },
  { value: 'non_adventist', label: 'Non-Adventist' },
];

eventTypes = [
  { value: 'Marriage', label: 'Marriage' },
  { value: 'Funeral', label: 'Funeral' },
  { value: 'Communion', label: 'Communion' },
  { value: 'Community service', label: 'Community Service' },
  { value: 'Outreach/Visitation', label: 'Outreach/Visitation' },
  { value: 'Child birth', label: 'Child Birth' },
  { value: 'Other', label: 'Other' },
];


// --- Dashboard Summary Objects ---
activitySummary: any = {};
baptismSummary: any = {};
transferSummary: any = {};
attendanceSummary: any = {};
dedicationSummary: any = {};
visitorSummary: any = {};
eventSummary: any = {};
isLoading:boolean = false


  // add others as needed

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private notification: NotificationService,
    private apiService: ApiService,

  ) {}



  ngOnInit(): void {
    // Load default data (e.g., current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);



    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = lastDay.toISOString().split('T')[0];
    this.selectedService = 'Divine Service'; // default
    this.selectedStatus = 'Adventist'; // default

     const currentUserString = localStorage.getItem('currentUser');
    let church = '';

    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString);
      this.church = currentUser.church;
      this.department = currentUser.department;
    }

    this.username = localStorage.getItem('username');

    this.fetchSummary();
  }


   fetchSummary(): void {
    this.loading = true;

    this.apiService.getChurchSummary(
        this.startDate,
        this.endDate,
    ).subscribe({
      next: (res) => {

        
        this.activitySummary = res.activity_summary || {};
        this.baptismSummary = res.baptism_summary || {};
        this.transferSummary = res.transfer_summary || {};
        this.attendanceSummary = res.attendance_summary || {};
        this.dedicationSummary = res.dedication_summary || {};
        this.loading = false;

        console.log(this.transferSummary?.church_summary)

      },
      error: (err) => {
        console.error(err.message || err);
        this.loading = false;
        this.handleSubmissionError(err);
      }
    });
  }



   applyFilter(): void {
    if (this.startDate && this.endDate) {
      this.fetchSummary();
    }
  }

   fetchSummaryAttendance(): void {
  this.loading = true;

  this.apiService.getChurchSummary(
    undefined, // No start date
    undefined, // No end date
    this.selectedService,
    this.selectedQuarter
  ).subscribe({
    next: (res) => {

      console.log('Full API Response:', res);  // Add this

      this.attendanceSummary = res.attendance_summary || {};
      this.loading = false;
      console.log(this.attendanceSummary?.church_summary);
    },
    error: (err) => {
      console.error(err.message || err);
      this.loading = false;
      this.handleSubmissionError(err);
    }
  });
}
  applyFilterAttendance(): void {
    if (this.selectedService && this.selectedQuarter) {
      this.fetchSummaryAttendance();
    }
  }





     fetchSummaryVisitor(): void {
  this.loading = true;

  this.apiService.getChurchSummary(
    undefined, // No start date
    undefined, // No end date
     undefined, // No service
    this.selectedQuarter,
    this.selectedStatus
  ).subscribe({
    next: (res) => {
      this.isLoading = true

      console.log('Full API Response:', res);  // Add this

      this.visitorSummary = res.visitor_summary || {};
      this.loading = false;
      this.isLoading = false
      console.log(this.visitorSummary?.visitor_summary);

    },
    error: (err) => {
      console.error(err.message || err);
      this.loading = false;
      this.isLoading = false
      this.handleSubmissionError(err);
    }
  });
}
  applyFilterVisitor(): void {
    if (this.selectedStatus && this.selectedQuarter) {
      this.fetchSummaryVisitor();
    }
  }





 

  


// Get church names as array for clean *ngFor iteration
  transferValues(): string[] {
    return Object.keys(this.transferSummary.church_summary);
  }




  
  // Format all date fields in the form data
  private formatFormDates(formData: any): any {
    const formattedData = { ...formData };
    
    // List all date fields that need formatting
    const dateFields = [
     'startDate',
     'endDate'
      // Add any other date fields here
    ];
  
    dateFields.forEach(field => {
      if (formattedData[field]) {
        formattedData[field] = this.formatDateForAPI(formattedData[field]);
      }
    });
  
    return formattedData;
  }
  
  
  
  // Reusable date formatter
  private formatDateForAPI(date: Date | string): string {
    if (!date) return '';
    
    // Handle both Date objects and string inputs
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return formatDate(dateObj, 'YYY-MM-DD', 'en-US');
  }



// Enhanced error handler
private handleSubmissionError(error: any): void {
  let errorMessage = 'Failed to fetch data';
  
  if (error.status === 400) {
    if (error.error) {
      // Handle date-specific errors
      const dateErrors: string[] = [];
      
      // Check each possible date field for errors
      ['startDate', 'endDate'].forEach(field => {
        if (error.error[field]) {
          dateErrors.push(`${field}: ${error.error[field].join(' ')}`);
        }
      });

      if (dateErrors.length > 0) {
        errorMessage = `Date errors:\n${dateErrors.join('\n')}`;
      } else {
        errorMessage = 'Validation errors: ' + 
          JSON.stringify(error.error, null, 2);
      }
    }
  } else if (error.status === 0) {
    errorMessage = 'Network error. Please check your connection.';
  } else if (error.status >= 500) {
    errorMessage = 'Server error. Please try again later.';
  }
  
  this.notification.error(errorMessage);
  console.error('Submission error details:', error);
}


}
