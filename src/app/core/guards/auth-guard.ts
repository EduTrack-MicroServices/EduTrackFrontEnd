import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    const decoded: any = jwtDecode(token);
    const isExpired = Math.floor(Date.now() / 1000) >= decoded.exp;

    if (isExpired) {
      localStorage.clear();
      router.navigate(['/login']);
      return false;
    }
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};