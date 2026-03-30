import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth'; // Adjust path if needed
import { Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgOptimizedImage],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Controls which form is visible ('register' or 'login')
  // Controls which form is visible ('register' or 'login')
  activeTab = signal<'login' | 'register'>('login');

  // Assumes you moved logo.png to the 'public' folder for Angular 17+
  logoPath = '/logo.png'; 

  // --- LOGIN FORM ---
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  // --- REGISTER FORM ---
  registerForm = this.fb.group({
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleType: ['STUDENT'] // Default selection
  });

  // --- SUBMIT HANDLERS ---
  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            toast.success('Welcome back to EduTrack!', {
              description: 'You have successfully logged in.',
              duration: 3500
            });

            // Route based on role
            if (res.data.role === 'ADMIN') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            const errorMessage = Array.isArray(res.errors) 
              ? res.errors.join(', ') 
              : (res.errors || 'Please check your credentials and try again.');
            toast.error('Login failed', { description: errorMessage });
          }
        },
        error: (err) => {
          if (err.status === 401 || err.status === 400) {
            toast.error('Invalid Credentials', { description: 'Incorrect email or password.' });
          } else {
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Server error.');
            toast.error('Login Error', { description: errorMessage });
          }
        }
      });
    } else {
      toast.warning('Invalid Form', { description: 'Please fill in both email and password.' });
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      const isInstructor = this.registerForm.value.roleType === 'INSTRUCTOR';
      
      const request$ = isInstructor 
        ? this.authService.registerProfessor(this.registerForm.value)
        : this.authService.registerStudent(this.registerForm.value);

      request$.subscribe({
        next: (res:any) => {

          if(res.success){
          toast.success('Registration Successful', {
            description: res.message || 'Your account has been created. You can now log in.',
            duration: 4000
          });
          // Reset form and switch to login tab
          console.log("registered")
          this.registerForm.reset({ roleType: 'STUDENT' });
          this.activeTab.set('login');
        }else{
          console.log("email exists")
          toast.warning('Registration unsuccessfull', {
            description: res.message || 'Your account has been created. You can now log in.',
            duration: 4000
          });

        }

        },
        error: (err) => {
          const backendErrors = err.error?.errors || err.error?.message;
          const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Registration failed.');
          toast.error('Registration Error', { description: errorMessage });
        }
      });
    } else {
      toast.warning('Invalid Form', { description: 'Please fill out all fields correctly.' });
    }
  }
}