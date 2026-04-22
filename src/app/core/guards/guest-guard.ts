import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If the user is already logged in, redirect them away from the login page
  if (authService.userRole()) {
    router.navigate(['/program-list']); 
    return false;
  }
  return true;
};