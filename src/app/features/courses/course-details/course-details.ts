import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Course, Module } from '../../../core/models/course';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment-service';

@Component({
  selector: 'app-course-details',
  imports: [CommonModule,RouterLink],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);


  course = signal<Course | null>(null);
  modules = signal<Module[]>([]);
  courseId!: number;

  isEnrolled = signal<boolean>(false);
  pId!: number;

  // Role check for Admin/Instructor
  isEditor = computed(() => {
    const role = this.authService.userRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });

  ngOnInit() {
    this.pId = Number(this.route.snapshot.paramMap.get('programId'));
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));

    if (this.pId) {
        this.checkEnrollment(this.pId);
      }
    this.loadCourseAndModules();
  }



  checkEnrollment(pId: number) {
  if (this.isEditor()) {
    this.isEnrolled.set(true); // Admins/Instructors always have access
    return;
  }
  
  const userId = this.authService.getUserId();
  this.enrollmentService.checkEnrollmentExists(userId, pId).subscribe(exists => {
    this.isEnrolled.set(exists);
  });
} 

  loadCourseAndModules() {
    // 1. Get Course Info
    this.courseService.getCourseById(this.courseId).subscribe(res => {
      if (res.success) this.course.set(res.data);
    });

    // 2. Get Modules List
    this.courseService.getModulesByCourse(this.courseId).subscribe(res => {
      if (res.success) {
        // Sort modules by sequenceOrder before displaying
        const sorted = res.data.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        this.modules.set(sorted);
      }
    });
  }

  onDeleteModule(moduleId: number) {
    if (confirm('Are you sure you want to delete this module?')) {
      this.courseService.deleteModule(moduleId).subscribe(() => {
        alert('Module removed successfully');


        this.loadCourseAndModules();
      });
    }
  }
}
