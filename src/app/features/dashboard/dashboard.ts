import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EnrollmentResponse } from '../../core/models/enrollment';
import { EnrollmentService } from '../../core/services/enrollment-service';
import { Program } from '../../core/models/course';
import { CourseService } from '../../core/services/course-service';
import { toast } from 'ngx-sonner'; // <-- Added Sonner for notifications
import { ProgramProgressResponse } from '../../core/models/progress';

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

  programProgress = signal<{ [key: number]: ProgramProgressResponse }>({});
  
  EnrollmentStatusUpdateRequest = {
    status: 'Completed'
  };
 

 
  // Dynamic Stats
 totalEnrolled = computed(() => this.enrolledPrograms().length);
   completedCount = computed(() => 
    Object.values(this.programProgress()).filter(p => p.programCompleted).length
  );
  overallCompletion = computed(() => {
    const total = this.totalEnrolled();
    if (total === 0) return 0;
    const completed = this.completedCount();
    return (completed / total) * 100;
  });

  ngOnInit() {
    if (this.userRole() === 'STUDENT') {
      this.loadMyEnrollments();
    }
  }
// NEW: Helper to remove enrollments for programs that no longer exist
  private handleOrphanedEnrollment(programId: number) {
    this.enrolledPrograms.update(enrollments => 
      enrollments.filter(e => e.programId !== programId)
    );
    
    // Also remove from progress map to keep stats accurate
    this.programProgress.update(prev => {
      const updated = { ...prev };
      delete updated[programId];
      return updated;
    });
  }

loadMyEnrollments() {
    const userId = this.authService.getUserId();
    this.enrollmentService.getEnrollmentsByStudent(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.enrolledPrograms.set(res.data);
          // Trigger these side-effects after enrollments are set
          this.getMyProgramDetails();
          this.loadAllProgress();
        }
      },
      error: () => toast.error('Failed to sync enrollments')
    });
  }

  loadAllProgress() {
    const userId = this.authService.getUserId();
    this.enrolledPrograms().forEach(enroll => {
      this.programService.getProgramProgress(enroll.programId, userId).subscribe({
        next: (res) => {
          if (res.success) {
            console.log(`Progress for Programmm ID ${enroll.programId}:`, res.data);
            // Update the map
            this.programProgress.update(prev => ({
              ...prev,
              [enroll.programId]: res.data
            }));
           
            // LOGIC FIX: If backend says program is 100% but enrollment is still 'Active'
            
            if (res.data.programCompleted && enroll.status !== 'Completed') {
              this.syncEnrollmentStatus(enroll.programId);
            }
          }
        }
      });
    });
  }

  private syncEnrollmentStatus(programId: number) {
    // Optional: Call your enrollment service to update the status in the DB
    // to match the 100% progress found in the course_completion table.



    this.enrollmentService.updateStatus(programId, this.EnrollmentStatusUpdateRequest).subscribe({
      next: () => {
        // Update local state to reflect the change immediately
        this.enrolledPrograms.update(enrollments => enrollments.map(enroll => 
          enroll.programId === programId ? { ...enroll, status: 'Completed' } : enroll    ));   
      },
      error: () => toast.error('Failed to sync enrollment status')
    });
    console.log(`Syncing enrollment for program ${programId} to COMPLETED`);
  }
  // Helper method for the template to get progress percentage
  getProgress(programId: number): number {
    return this.programProgress()[programId]?.completionPercentage || 0;
  }

getMyProgramDetails() {
    this.programDetails.set([]); // Clear previous details
    const currentEnrollments = this.enrolledPrograms();

    currentEnrollments.forEach(enroll => {
      this.programService.getProgramById(enroll.programId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            // Program exists: add to details list
            this.programDetails.update(details => [...details, res.data]);
          } else {
            // Program exists in Enrollment but not in Program table (Soft-deleted or Orphanded)
            this.handleOrphanedEnrollment(enroll.programId);
          }
        },
        error: (err) => {
          console.error(`Program ${enroll.programId} not found or deleted:`, err);
          // If the error is a 404, it means the admin deleted the program
          this.handleOrphanedEnrollment(enroll.programId);
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