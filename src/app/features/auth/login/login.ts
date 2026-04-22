import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

constructor(authService: AuthService) {
  
}



  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            toast.success('Welcome to EduTrack!', {
              description: 'You have successfully logged in.',
              duration: 3500
            });

            if (res.data.role === 'ADMIN') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            const errorMessage = Array.isArray(res.errors) 
              ? res.errors.join(', ') 
              : (res.errors || 'Please check your credentials and try again.');

            toast.error('Login failed', {
              description: errorMessage,
              duration: 5000
            });
          }
        },
        error: (err) => {
          // Check if the backend returned a 401 (Unauthorized) or 400 (Bad Request)
          if (err.status === 401 || err.status === 400) {
            toast.error('Invalid Credentials', {
              description: 'The email or password you entered is incorrect.',
              duration: 5000
            });
          } else {
            // This handles actual server crashes (500) or if the backend is offline (0)
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) 
              ? backendErrors.join(', ') 
              : (backendErrors || 'Unable to connect to the server. Please try again later.');

            toast.error('Login Error', {
              description: errorMessage,
              duration: 5000
            });
          }
        }
      });
    } else {
      toast.warning('Invalid Form', {
        description: 'Please fill in both email and password.',
      });
    }
  }
}