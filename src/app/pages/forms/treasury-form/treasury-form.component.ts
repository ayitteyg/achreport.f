import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmdialogComponent } from '../../../components/confirmdialog/confirmdialog.component';
import { ApiService } from '../../../services/api.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-treasury-form',
  standalone: false,
  templateUrl: './treasury-form.component.html',
  styleUrl: './treasury-form.component.css'
})
export class TreasuryFormComponent {


  treasuryForm: FormGroup;
  departmentSearch: string = '';
  filteredDepartments: string[] = [];
  departmentFilterControl = new FormControl();

  isSubmitting:boolean = false;



  // activity-form.component.ts (snippet only)
churchList = ['Achimota', 'Prince of Peace', 'King of Glory', 'Nii Boi Town', 'Israel'];

departmentList = ['Treasury'];

typeList = ['local', 'district', 'zonal', 'conference'];

ratingList = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  router: any;
 

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private notification: NotificationService,
    private apiService : ApiService
   
  ) {
    this.treasuryForm = this.fb.group({
     church: ['', Validators.required],
  date: ['', Validators.required],
  department: ['Treasury', Validators.required],
  returnees: [0, [Validators.required, Validators.min(0)]],
  tithe: [0, [Validators.required, Validators.min(0)]],
  combined: [0, [Validators.required, Validators.min(0)]],
  loose: [0, [Validators.required, Validators.min(0)]],
  other_receipts: [0, [Validators.required, Validators.min(0)]],
  payments: [0, [Validators.required, Validators.min(0)]]
    });
  }



  confirmSubmission(): void {
  if (!this.treasuryForm.valid || this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;


  // Format all dates in the form data
  const formData = this.formatFormDates(this.treasuryForm.value);

  this.apiService.createTreasury(formData).subscribe({
    next: (response) => {
      this.notification.success('finance saved successfully');
      this.treasuryForm.reset();
      this.isSubmitting = false;
      this.router.navigate(['/landing-page']);
    },
    error: (error) => {
      this.isSubmitting = false;
      this.handleSubmissionError(error);
    }
  });
}




// Format all date fields in the form data
private formatFormDates(formData: any): any {
  const formattedData = { ...formData };
  
  // List all date fields that need formatting
  const dateFields = [
    'date',
   
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
  
  return formatDate(dateObj, 'yyyy-MM-dd', 'en-US');
}


// Enhanced error handler
private handleSubmissionError(error: any): void {
  let errorMessage = 'Failed to save baptism data';
  
  if (error.status === 400) {
    if (error.error) {
      // Handle date-specific errors
      const dateErrors: string[] = [];
      
      // Check each possible date field for errors
      ['date'].forEach(field => {
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
