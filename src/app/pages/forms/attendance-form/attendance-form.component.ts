import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmdialogComponent } from '../../../components/confirmdialog/confirmdialog.component';
import { ApiService } from '../../../services/api.service';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-attendance-form',
  standalone: false,
  templateUrl: './attendance-form.component.html',
  styleUrl: './attendance-form.component.css'
})
export class AttendanceFormComponent {

attendanceForm: FormGroup;
churchList = ['Achimota', 'Prince of Peace', 'King of Glory', 'Nii Boi Town', 'Israel'];
typeList = ['local', 'district', 'zonal', 'conference'];
serviceList = [
  'Mid-Week Service',
  'Bible Studies',
  'Sabbath School',
  'Divine Service',
  'Others'
];

isSubmitting = false;
  router: any;


constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private notification: NotificationService,
    private apiService : ApiService
   
  ) {
    this.attendanceForm = this.fb.group({
        church: ['', Validators.required],
        date: ['', Validators.required],
        service: ['', Validators.required],
        adult: [0, [Validators.required, Validators.min(0)]],
        youth: [0, [Validators.required, Validators.min(0)]],
        children: [0, [Validators.required, Validators.min(0)]]
          });
  }



  confirmSubmission(): void {
  if (!this.attendanceForm.valid || this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;


  // Format all dates in the form data
  const formData = this.formatFormDates(this.attendanceForm.value);

  this.apiService.createAttendance(formData).subscribe({
    next: (response) => {
      this.notification.success('attendance saved successfully');
      this.attendanceForm.reset();
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
