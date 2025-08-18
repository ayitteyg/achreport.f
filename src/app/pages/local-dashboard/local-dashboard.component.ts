import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-local-dashboard',
  standalone: false,
  templateUrl: './local-dashboard.component.html',
  styleUrl: './local-dashboard.component.css'
})
export class LocalDashboardComponent {


  
loading = false;

// --- Date Range ---
startDate!: string;
endDate!: string;
username!: any;
church!: string;
department!: string;


// --- Dashboard Summary Objects ---
departmentSummary: any = {};
departmentDetails: any = {};



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

   
    this.apiService.getDepartmentSummary(
        this.startDate,
        this.endDate,
    ).subscribe({
      next: (res) => {

        console.log(res)
        
        this.departmentSummary = res.summary || {};
        this.departmentDetails = res.detail || [];
        this.loading = false;

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
