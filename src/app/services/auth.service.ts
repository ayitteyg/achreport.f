import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})



export class AuthService {
  private loginUrl =  environment.apiUrl + '/token-auth/';
 
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { username, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', username);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }




isAnniversaryOfficer(): boolean {
  const user = this.getUser();
  return user ? user.isAnniversary : false;
}

  getUserId(): number | null {
    const user = localStorage.getItem('currentUser');
    if (user) {
      return JSON.parse(user).usid;
    }
    return null;
  }

  getMemberId(): number | null {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        return JSON.parse(user).mid;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
