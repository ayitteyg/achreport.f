import { Component, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';





@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})



export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitted = false;
  errorMessage = '';
  // Add this property
  isLoading: boolean = false;
  currentTime: string = '';

  //typing effect
  fullText: string = 'ACH.REPORT.SUBMIT';
  displayedText: string = '';
  currentIndex: number = 0;
  intervalId: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notification: NotificationService
  ) 
  
  
  {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['ach.21.2.98', [Validators.required, Validators.minLength(6)]]
    });
  }

    ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000); // Update every second
    this.startTyping();
  }

  // Getter for easy access to form fields
  get formControls() {
    return this.loginForm.controls;
  }


onSubmit() {
  this.isSubmitted = true;

  if (this.loginForm.invalid) {
    // Use iziToast for form validation errors (more visible)
    this.notification.warning(
      'Form Validation', 
      'Please fill in all required fields correctly'
    );
    return;
  }
 
  this.isLoading = true;
  const { username, password } = this.loginForm.value;

  // console.log(username, password)

  this.authService.login(username.trim(), password.trim()).subscribe({
    next: (response) => {

    //console.log('Login response:', response);  // <-- move log here

      // Save user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify({
        mid: response.mid,
        usid: response.usid,
        name: response.name,
        church: response.church,
        username: response.ussername,
        department: response.department,
        isLocal: response.isLocal,
        isDistrict: response.isDistrict,
        isAnniversary:response.isAnniversary
        
       
      }));

     // console.log(localStorage)

   

      // Dynamic Routing Based on Role
     //this.router.navigate(['/homepage']);
       
          if (this.authService.isAnniversaryOfficer()) {
           console.log("printing....1")
          this.router.navigate(['/anniversary']);
        } else {
           console.log("printing....2")
          this.router.navigate(['/homepage']);
        }

           // Use iziToast for success notification (more prominent)
          this.notification.success(
            'Login Successful', 
            // `Welcome back, ${response.employee_name || response.username}!`
          );
        
    },
    error: (err) => { 
      this.errorMessage = err.error?.non_field_errors?.[0] || 'Invalid username or password';
      this.isLoading = false;
      
      // Use iziToast for error notification (more attention-grabbing)
      this.notification.error(
        'Login Failed', 
        this.errorMessage
      );
      
      // Optional: Use Material Snackbar for additional error details
      this.notification.error('Please try again');
    },
    complete: () => {
      this.isLoading = false;
    }
  });
}



updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }


   startTyping() {
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.displayedText += this.fullText[this.currentIndex];
        this.currentIndex++;
      } else {
        clearInterval(this.intervalId); // Stop when complete
      }
    }, 150); // Speed: 150ms per letter, you can adjust this
  }

}

