import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 1. Get user role and normalize it to uppercase
  const userRole = localStorage.getItem('role')?.toUpperCase();
  
  // 2. Get the array of expected roles from route data
  const expectedRoles = route.data['roles'] as Array<string>;

  // 3. Check if the user's role is in the list
  if (userRole && expectedRoles.includes(userRole)) {
    return true;
  } else {
    alert('Access Denied: Your role (' + userRole + ') does not have permission.');
    router.navigate(['/dashboard']);
    return false;
  }
};