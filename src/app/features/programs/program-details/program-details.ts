import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Program, Course } from '../../../core/models/course';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment-service';
import { EnrollmentRequest } from '../../../core/models/enrollment';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast

@Component({
  selector: 'app-program-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './program-details.html',
  styleUrl: './program-details.css',
})
export class ProgramDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);
  private router = inject(Router);

  isLoading = signal<boolean>(true);  isEnrolled = signal<boolean>(false);
  program = signal<Program | null>(null);
  courses = signal<Course[]>([]);
  programId!: number;

  // Check if user is Admin or Instructor
  isEditor = computed(() => {
    const role = this.authService.userRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });

  ngOnInit() {
    this.programId = Number(this.route.snapshot.paramMap.get('id'));
    this.checkStatus();
    this.loadData();
  }




 

  loadData() {
    this.isLoading.set(true); // Start loading
    
    // Use forkJoin if you want to wait for both, 
    // or just set loading to false when the main content (courses) arrives.
    this.courseService.getProgramById(this.programId).subscribe(res => {
      if (res.success) this.program.set(res.data);
    });

    this.courseService.getCoursesByProgram(this.programId).subscribe({
      next: (res) => {
        if (res.success) this.courses.set(res.data);
        this.isLoading.set(false); // Stop loading
      },
      error: () => this.isLoading.set(false) // Stop even on error
    });
  }
  

  checkStatus() {
    // Consistently using your authService helper instead of raw localStorage
    const userId = this.authService.getUserId(); 
    if (userId) {
      this.enrollmentService.checkEnrollmentExists(userId, this.programId).subscribe(exists => {
        this.isEnrolled.set(exists);
      });
    }
  }

 
  onDeleteCourse(courseId: number) {
    // Action Toast replacing the confirm() dialog
    toast.warning('Delete this course?', {
      description: 'Are you sure? This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => {
          this.courseService.deleteCourse(courseId).subscribe({
            next: () => {
              toast.success('Course Deleted successfully', { duration: 3000 });
              this.loadData(); // Refresh list
            },
            error: (err) => {
              toast.error('Failed to delete course', {
                description: err.error?.message || 'An error occurred.',
                duration: 4000
              });
            }
          });
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    });
  }

  onEnroll() {
    const userId = this.authService.getUserId(); 
    
    if (userId === 0 || !userId) {
      // Replaced alert with error toast
      toast.error('Session Expired', {
        description: 'Please login again to enroll in this program.',
        duration: 4000
      });
      this.router.navigate(['/']); // Redirect to login/home
      return;
    }

    const request: EnrollmentRequest = {
      programId: this.programId,
      userId: userId
    };

    this.enrollmentService.createEnrollment(request).subscribe({
      next: (res) => {
        if (res.success) {
          toast.success('Enrolled successfully!', {
            description: 'Welcome to the program!',
            duration: 3500
          });
          this.isEnrolled.set(true);
        }
      },
      error: (err) => {
        toast.error('Enrollment Failed', {
          description: err.error?.message || 'Could not process your enrollment at this time.',
          duration: 4000
        });
      }
    });
  }
}