import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentResponse } from '../../core/models/enrollment';
import { EnrollmentService } from '../../core/services/enrollment-service';
import { Program } from '../../core/models/course';
import { CourseService } from '../../core/services/course-service';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Assuming standalone based on previous code
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
  programDetails = signal<Program[]>([]); // For students to show enrolled program details

  // Dynamic Stats
  totalEnrolled = computed(() => this.enrolledPrograms().length);
  completedCount = computed(() => this.enrolledPrograms().filter(e => e.status === 'Completed').length);

  ngOnInit() {
    if (this.userRole() === 'STUDENT') {
      this.loadMyEnrollments();
     
    }
  }

   getMyProgramDetails() {
    this.programDetails.set([]); // Clear previous details
   
    console.log('Fetching program details for enrolled programs:', this.enrolledPrograms());
    // Fetch details for each enrolled program  

    this.enrolledPrograms().forEach(enroll => {
      this.programService.getProgramById(enroll.programId).subscribe({
        next: (res) => {
          if (res.success) {
            this.programDetails.update(details => [...details, res.data]);
            console.log('Fetched program details for programId:', enroll.programId, res.data);
          }
        },
        error: (err) => console.error('Error fetching program details:', err)
      });
    });
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
      error: (err) => console.error('Dashboard Error:', err)
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}