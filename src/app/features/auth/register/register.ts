import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner'; // <-- Import Sonner

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // This matches your UserRequest DTO exactly
  registerForm = this.fb.group({
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleType: ['STUDENT'] // Default selection
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const isInstructor = this.registerForm.value.roleType === 'INSTRUCTOR';
      
      // Choose service method based on roleType
      const request$ = isInstructor 
        ? this.authService.registerProfessor(this.registerForm.value)
        : this.authService.registerStudent(this.registerForm.value);

      request$.subscribe({
        next: (res: any) => {
          // Success Toast
          toast.success('Registration Successful', {
            description: res.message || 'Your account has been created. You can now log in.',
            duration: 3500
          });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // Error Toast: Handle both string arrays and single string messages
          const backendErrors = err.error?.errors || err.error?.message;
          const errorMessage = Array.isArray(backendErrors) 
            ? backendErrors.join(', ') 
            : (backendErrors || 'Registration failed. Please try again later.');

          toast.error('Registration Error', {
            description: errorMessage,
            duration: 5000
          });
        }
      });
    } else {
      // Warning Toast for invalid forms
      toast.warning('Invalid Form', {
        description: 'Please ensure all fields are filled out correctly.',
      });
    }
  }
}