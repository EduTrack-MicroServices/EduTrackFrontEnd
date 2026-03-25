import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 means the JWT is either invalid or expired
      if (error.status === 401) {
        
        // Show a beautiful error toast instead of an alert
        toast.error('Session Expired', {
          description: 'Your secure session has ended. Please sign in again.',
          duration: 4000
        });
        
        // Clear everything so the app doesn't try to use the bad token again
        authService.logout(); 
        
        // Redirect to your new unified home page where the login card is
        router.navigate(['/']); 
      }
      
      // Pass the error along to the component if it needs to show a specific message
      return throwError(() => error);
    })
  );
};