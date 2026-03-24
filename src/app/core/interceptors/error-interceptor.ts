import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 means the JWT is either invalid or expired
      if (error.status === 401) {
        alert('Your session has expired. Please login again.');
        
        // Clear everything so the app doesn't try to use the bad token again
        authService.logout(); 
        // router.navigate(['/login']);
      }
      
      // Pass the error along to the component if it needs to show a specific message
      return throwError(() => error);
    })
  );
};