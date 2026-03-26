import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for the search bar
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserResponse } from '../../core/models/auth';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-studentprogress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './studentprogress.html',
  styleUrl: './studentprogress.css',
})
export class Studentprogress implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Modern Angular Signals for state management
  students = signal<UserResponse[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');

  // Computed signal: Automatically updates whenever 'students' or 'searchQuery' changes
  filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.students();
    }
    return this.students().filter(student => 
      student.userName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.userId.toString().includes(query)
    );
  });

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Filter out only the users who have the STUDENT role
          const onlyStudents = res.data.filter(u => u.role === 'STUDENT');
          this.students.set(onlyStudents);
        }
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Failed to load students');
        this.isLoading.set(false);
      }
    });
  }

  viewStudentAnalysis(studentId: number) {
    // Navigate to the analysis page passing the student's ID
    this.router.navigate(['/analysispage', studentId]);
  }
}