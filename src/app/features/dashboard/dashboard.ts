import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentResponse } from '../../core/models/enrollment';
import { EnrollmentService } from '../../core/services/enrollment-service';
import { Program } from '../../core/models/course';
import { CourseService } from '../../core/services/course-service';
import { toast } from 'ngx-sonner'; // <-- Added Sonner for notifications

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);
  private router = inject(Router);
  private programService = inject(CourseService);

  today = new Date();
  enrolledPrograms = signal<EnrollmentResponse[]>([]);
  userRole = this.authService.userRole;
  programDetails = signal<Program[]>([]); 

  // Dynamic Stats
  totalEnrolled = computed(() => this.enrolledPrograms().length);
  completedCount = computed(() => this.enrolledPrograms().filter(e => e.status === 'Completed').length);

  ngOnInit() {
    if (this.userRole() === 'STUDENT') {
      this.loadMyEnrollments();
    }
  }

  loadMyEnrollments() {
    const userId = this.authService.getUserId();
    this.enrollmentService.getEnrollmentsByStudent(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.enrolledPrograms.set(res.data);
          this.getMyProgramDetails();
        }
      },
      error: (err) => {
        console.error('Dashboard Error:', err);
        toast.error('Failed to load enrollments', {
          description: 'Could not fetch your enrolled programs at this time.'
        });
      }
    });
  }

  getMyProgramDetails() {
    this.programDetails.set([]); // Clear previous details
    
    this.enrolledPrograms().forEach(enroll => {
      this.programService.getProgramById(enroll.programId).subscribe({
        next: (res) => {
          if (res.success) {
            this.programDetails.update(details => [...details, res.data]);
          }
        },
        error: (err) => {
          console.error('Error fetching program details:', err);
          toast.error('Failed to load program details', {
            description: `Could not fetch details for Program ID: ${enroll.programId}`
          });
        }
      });
    });
  }

  onLogout() {
    this.authService.logout();
    toast.info('Logged Out', {
      description: 'You have been successfully logged out.'
    });
    this.router.navigate(['/']); // Redirect to home page after logout
  }
}