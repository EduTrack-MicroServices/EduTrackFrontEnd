import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userRole = localStorage.getItem('role');
  const expectedRole = route.data['role'];


   if (userRole?.toUpperCase() === expectedRole?.toUpperCase()) {
    return true;
     }
  else {
    alert('Access Denied: You do not have the required permissions.');
    router.navigate(['/dashboard']);
    return false;
  }
};