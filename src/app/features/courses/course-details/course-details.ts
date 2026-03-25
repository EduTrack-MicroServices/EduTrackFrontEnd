import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Course, Module } from '../../../core/models/course';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment-service';
import { AssessmentService } from '../../../core/services/assessment-service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private enrollmentService = inject(EnrollmentService);
  private assessmentService = inject(AssessmentService);
  private cdr = inject(ChangeDetectorRef);

  course = signal<Course | null>(null);
  modules = signal<Module[]>([]);
  courseId!: number;
  pId!: number;

  // State for Assessment & Submissions
  hasAssessment = false;
  submission = signal<any | null>(null); 
  isEnrolled = signal<boolean>(false);

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
    this.loadAssessment();
  }

  loadAssessment() {
    this.assessmentService.getAssessmentByCourseId(this.courseId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.hasAssessment = true;
          // If assessment exists and user is a student, check if they already submitted
          if (!this.isEditor()) {
            this.checkUserSubmission(res.data.assessmentId);
          }
        } else {
          this.hasAssessment = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasAssessment = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkUserSubmission(assessmentId: number) {
    const userId = this.authService.getUserId();
    this.assessmentService.checkSubmission(userId, assessmentId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.submission.set(res.data);
          this.cdr.detectChanges();
        }
      }
    });
  }

  checkEnrollment(pId: number) {
    if (this.isEditor()) {
      this.isEnrolled.set(true);
      return;
    }
    const userId = this.authService.getUserId();
    this.enrollmentService.checkEnrollmentExists(userId, pId).subscribe((exists) => {
      this.isEnrolled.set(exists);
    });
  }

  loadCourseAndModules() {
    this.courseService.getCourseById(this.courseId).subscribe((res) => {
      if (res.success) this.course.set(res.data);
    });

    this.courseService.getModulesByCourse(this.courseId).subscribe((res) => {
      if (res.success) {
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