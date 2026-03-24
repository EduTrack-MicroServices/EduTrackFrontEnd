import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const authService = inject(AuthService);

  if (token) {
    const decoded: any = jwtDecode(token);
    const isExpired = Math.floor(Date.now() / 1000) >= decoded.exp;

    if (isExpired) {
       authService.logout();
      return false;
    }
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};