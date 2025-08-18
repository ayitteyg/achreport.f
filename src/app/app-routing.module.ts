import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';

const routes: Routes = [
   { path:'', component:LoginComponent },
   { path:'landing-page', component:LandingPageComponent },
   { path:'homepage', component:HomepageComponent },
  
   
  
  {path: '**',   component:HomepageComponent },
  
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
