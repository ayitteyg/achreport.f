import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {


  activeForm: string | null = null; // Tracks which form is currently open

  toggleForm(formName: string) {
    // If clicking the already open form, close it
    // Otherwise, open the clicked form and close others
    this.activeForm = this.activeForm === formName ? null : formName;
  }

  isFormOpen(formName: string): boolean {
    return this.activeForm === formName;
  }
}
