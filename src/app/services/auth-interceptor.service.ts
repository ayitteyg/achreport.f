import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';




@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (req.url.includes('/token-auth/')) {
        return next.handle(req);  // Skip adding Authorization for login
      }

      const token = this.authService.getToken();
      if (token) {
        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Token ${token}`)
        });
        return next.handle(cloned);
      }
      return next.handle(req).pipe(
        catchError(error => {
          if (error.status === 401) {
            // Optionally redirect to login page or show a message
            console.error('Unauthorized! Please login again.');
          }
          return throwError(() => error);
        })
      );
    }
}
