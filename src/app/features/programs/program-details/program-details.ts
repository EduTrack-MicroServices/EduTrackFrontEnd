import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Program, Course } from '../../../core/models/course';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment-service';
import { EnrollmentRequest } from '../../../core/models/enrollment';

@Component({
  selector: 'app-program-details',
  imports: [CommonModule,RouterLink],
  templateUrl: './program-details.html',
  styleUrl: './program-details.css',
})
export class ProgramDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);

  private enrollmentService = inject(EnrollmentService);
  isEnrolled = signal<boolean>(false);

  private router = inject(Router);

  isLoading = signal<boolean>(true);

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
  const userId = Number(localStorage.getItem('userId')); // Make sure you save this on login!
  this.enrollmentService.checkEnrollmentExists(userId, this.programId).subscribe(exists => {
    this.isEnrolled.set(exists);
  });
}

 
  onDeleteCourse(courseId: number) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe(() => {
        alert('Course Deleted');
        this.loadData(); // Refresh list
      });
    }
  }


  onEnroll() {
  const userId = this.authService.getUserId(); // Uses the helper we just made
  
  if (userId === 0) {
    alert('Session expired. Please login again.');
    return;
  }

  const request: EnrollmentRequest = {
    programId: this.programId,
    userId: userId
  };

  this.enrollmentService.createEnrollment(request).subscribe({
    next: (res) => {
      if (res.success) {
        alert('Enrolled successfully!');
        this.isEnrolled.set(true);
      }
    }
  });
}

}
