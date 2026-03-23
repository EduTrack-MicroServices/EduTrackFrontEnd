import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  // 1. Check if the URL is for Login or Register
  const isAuthRequest = req.url.includes('/auth/login') || 
                        req.url.includes('/users/registerUser') || 
                        req.url.includes('/users/registerProfessor');

  // 2. ONLY add the token if it's NOT a public auth request
  if (token && !isAuthRequest) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  
  return next(req);
};