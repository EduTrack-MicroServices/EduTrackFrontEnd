import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { AttendanceService } from '../../core/services/attendance'; // <-- Add your path
import { AttendanceSummaryResponse } from '../../core/models/attendance'; // <-- Add your path

@Component({
  selector: 'app-profilepage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profilepage.html',
  styleUrls: ['./profilepage.css'],
})
export class Profilepage implements OnInit {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private fb = inject(FormBuilder);

  // Signals
  userProfile = signal<any>(null); 
  isLoading = signal<boolean>(true);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  // Attendance Signals
  attendanceSummary = signal<AttendanceSummaryResponse | null>(null);
  
  // Automatically calculates the percentage whenever attendanceSummary changes
  attendancePercentage = computed(() => {
    const data = this.attendanceSummary();
    if (!data || data.totalDays === 0) return 0;
    return Math.round((data.presentDays / data.totalDays) * 100);
  });

  passwordForm!: FormGroup;

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadData(userId);
    } else {
      this.isLoading.set(false);
    }

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  loadData(userId: number) {
    // 1. Fetch Profile
    this.authService.getUserProfile(userId).subscribe({
      next: (res: any) => {
        this.userProfile.set(res.success && res.data ? res.data : res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.errorMessage.set('Failed to load user data.');
        this.isLoading.set(false);
      }
    });

    // 2. Fetch Attendance
    this.attendanceService.getAttendanceSummary(userId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.attendanceSummary.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load attendance', err)
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    const userId = this.authService.getUserId();
    const payload = {
      userId: userId,
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage.set('Password updated successfully!');
          this.errorMessage.set('');
          this.passwordForm.reset();
        } else {
          this.errorMessage.set(res.message || 'Failed to update password.');
          this.successMessage.set('');
        }
      },
      error: (err) => {
        this.errorMessage.set('An error occurred while changing the password.');
        this.successMessage.set('');
      }
    });
  }
}