import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmdialogComponent } from '../../../components/confirmdialog/confirmdialog.component';
import { ApiService } from '../../../services/api.service';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-activity-forms',
  standalone: false,
  templateUrl: './activity-forms.component.html',
  styleUrl: './activity-forms.component.css'
})
export class ActivityFormsComponent {

  activityForm: FormGroup;
  departmentSearch: string = '';
  filteredDepartments: string[] = [];
  departmentFilterControl = new FormControl();

  isSubmitting:boolean = false;



  // activity-form.component.ts (snippet only)
churchList = ['Achimota', 'Prince of Peace', 'King of Glory', 'Nii Boi Town', 'Israel'];

departmentList = [
  'Treasury', 'Secretariat', 'Deaconry', 'Sabbath School', 'Religious Liberty/VOP', 'Health',
  'Stewardship', 'Personal Ministry', 'Possibility Ministry', 'Communication', 'Children Ministry',
  'Publishing Ministry', 'Music', 'Adventist Men Ministry', 'Womens Ministry', 'Audit', 'Youth',
  'Family Ministry', 'Education', 'Welfare', 'PA System', 'Interest Coordinator', 'Community Service',
  'Project', 'Congregation', 'admin'
];

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
    this.activityForm = this.fb.group({
      church: ['', Validators.required],
      department: ['', Validators.required],
      program: ['', Validators.required],
      date: ['', Validators.required],
      typ: ['', Validators.required],
      facilitator: [''],
      expense: [''],
      income: [''],
      rating: ['Good']
    });
  }



  initializeForm() {
  this.activityForm = this.fb.group({
    church: ['', Validators.required],
    department: ['', Validators.required],
    program: ['', Validators.required],
    date: ['', Validators.required],
    typ: ['', Validators.required],
    facilitator: [''],
    expense: [''],
    income: [''],
    rating: ['Good']
  });
}


  ngOnInit(): void {
  this.filteredDepartments = this.departmentList.slice();

  this.departmentFilterControl.valueChanges.subscribe(search => {
    const query = (search || '').toLowerCase();
    this.filteredDepartments = this.departmentList.filter(dept =>
      dept.toLowerCase().includes(query)
    );
  });
}


confirmSubmission(): void {
  if (!this.activityForm.valid || this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;

  // Format the data before sending
  const formData = {
    ...this.activityForm.value,
    date: this.formatDateForAPI(this.activityForm.value.date)
  };

  this.apiService.createActivity(formData).subscribe({
    next: (response) => {
      this.notification.success('Activity saved successfully');
      this.activityForm.reset();
      this.isSubmitting = false;
      this.router.navigate(['/landing-page']);
    },
    error: (error) => {
      this.isSubmitting = false;
      this.handleSubmissionError(error);
    }
  });
}


  filterDepartments() {
  const query = this.departmentSearch.toLowerCase();
  this.filteredDepartments = this.departmentList.filter(dept =>
    dept.toLowerCase().includes(query)
  );
}


private formatDateForAPI(date: Date): string {
  return formatDate(date, 'yyyy-MM-dd', 'en-US');
}

private handleSubmissionError(error: any): void {
  let errorMessage = 'Failed to save activity';
  
  if (error.status === 400) {
    if (error.error?.date) {
      errorMessage = `Date error: ${error.error.date.join(' ')}`;
    } else {
      errorMessage = 'Validation errors: ' + 
        JSON.stringify(error.error, null, 2);
    }
  } else if (error.status === 0) {
    errorMessage = 'Network error. Please check your connection.';
  }
  
  this.notification.error(errorMessage);
  console.error('Submission error details:', error);
}

}
