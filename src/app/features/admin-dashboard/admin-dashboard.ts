import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { UserResponse } from '../../core/models/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);

  users = signal<UserResponse[]>([]);
  loading = signal<boolean>(false);

  totalInstructors = computed(() => this.users().filter(u => u.role === 'INSTRUCTOR').length);
  totalStudents = computed(() => this.users().filter(u => u.role === 'STUDENT').length);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  approveInstructor(email: string) {
    if (confirm(`Approve instructor ${email}?`)) {
      this.authService.approveInstructor(email).subscribe({
        next: () => {
          alert('Instructor APPROVED');
          this.loadUsers();
        }
      });
    }
  }

  rejectInstructor(email: string) {
    if (confirm(`Reject instructor ${email}? This will set status to REJECTED.`)) {
      this.authService.rejectInstructor(email).subscribe({
        next: () => {
          alert('Instructor REJECTED');
          this.loadUsers();
        }
      });
    }
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.loadUsers();
        },
        error: (err) => alert(err.error?.message || 'Delete failed')
      });
    }
  }
}