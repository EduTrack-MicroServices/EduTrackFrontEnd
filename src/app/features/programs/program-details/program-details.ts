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


  

  checkStatus() {
  const userId = Number(localStorage.getItem('userId')); // Make sure you save this on login!
  this.enrollmentService.checkEnrollmentExists(userId, this.programId).subscribe(exists => {
    this.isEnrolled.set(exists);
  });
}

  loadData() {
    // 1. Get Program Details
    this.courseService.getProgramById(this.programId).subscribe(res => {
      if (res.success) this.program.set(res.data);
    });

    // 2. Get Courses for this Program
    this.courseService.getCoursesByProgram(this.programId).subscribe(res => {
      if (res.success) this.courses.set(res.data);
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
