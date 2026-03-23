import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
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

  onSubmit() {
  if (this.loginForm.valid) {
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        // CHECK THE SUCCESS BOOLEAN FIRST
        if (res.success && res.data) {
          alert('Welcome to EduTrack!');
          if (res.data.role === 'ADMIN') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          // This handles cases where status is 200 but user was not found
          alert(res.errors || 'Login failed');
        }
      },
      error: (err) => {
        // This handles actual HTTP crashes (404, 500, etc.)
        alert(err.error?.errors || 'Server error occurred');
      }
    });
  }
}
}
