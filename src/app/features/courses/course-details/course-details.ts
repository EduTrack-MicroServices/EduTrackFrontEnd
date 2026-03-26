import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Course, Module } from '../../../core/models/course';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment-service';
import { AssessmentService } from '../../../core/services/assessment-service';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast
 
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

  canTakeAssessment = signal<boolean>(false);
  completedCount = signal<number>(0);
 
  ngOnInit() {
    this.pId = Number(this.route.snapshot.paramMap.get('programId'));
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));

    // FIX: Set enrollment true immediately for editors to prevent UI flickering
    if (this.isEditor()) {
      this.isEnrolled.set(true);
    } else if (this.pId) {
      this.checkEnrollment(this.pId);
    }

    this.loadCourseAndModules();
    this.loadAssessment();
    
    if (!this.isEditor()) {
      this.checkCourseProgress();
    }
  }

  checkCourseProgress() {
    const userId = this.authService.getUserId();
    this.courseService.getCourseProgressStatus(this.courseId, userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.canTakeAssessment.set(res.data.canTakeAssessment);
          this.completedCount.set(res.data.completedModules);
          this.cdr.detectChanges();
        }
      }
    });
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
    // Double check here as well
    if (this.isEditor()) {
      this.isEnrolled.set(true);
      return;
    }

    const userId = this.authService.getUserId();
    this.enrollmentService.checkEnrollmentExists(userId, pId).subscribe({
      next: (exists) => {
        this.isEnrolled.set(exists);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isEnrolled.set(false);
      }
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
    // Action Toast replacing the confirm() dialog
    toast.warning('Delete this module?', {
      description: 'Are you sure? This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => {
          // Execute deletion only if they click the Delete action inside the toast
          this.courseService.deleteModule(moduleId).subscribe({
            next: () => {
              // Success Toast replacing the alert()
              toast.success('Module removed successfully', {
                duration: 3000
              });
              this.loadCourseAndModules();
            },
            error: (err) => {
              toast.error('Failed to delete module', {
                description: err.error?.message || 'An error occurred.',
                duration: 4000
              });
            }
          });
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          // Optional: Do nothing, just close the toast
        }
      }
    });
  }
}