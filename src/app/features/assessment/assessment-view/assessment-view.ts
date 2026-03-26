import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment-service';
import { Assessment } from '../../../core/models/assessment';
import { Submission } from '../../../core/models/submission';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth'; 

@Component({
  standalone: true,
  selector: 'app-assessment-view',
  imports: [CommonModule, RouterLink], 
  templateUrl: './assessment-view.html'
})
export class AssessmentViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(AssessmentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  courseId!: number;
  assessment: Assessment | null = null;
  isLoading = true;
  isAlreadySubmitted = false;
  submissionData: Submission | null = null;

  isEditor = (): boolean => {
    const role = this.authService.userRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('courseId');
    this.courseId = Number(idParam);

    const storedUserId = localStorage.getItem('userId');
    const userId = storedUserId ? Number(storedUserId) : null;

    // 1. Fetch Assessment Details
    this.api.getAssessmentByCourseId(this.courseId).subscribe({
      next: (res: any) => {
        this.assessment = res?.data || res;
        
        if (this.assessment && !this.isEditor() && userId) {
          // 2. Verify if student has already submitted
          this.verifyUserSubmission(userId, this.assessment.assessmentId);
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading assessment:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private verifyUserSubmission(userId: number, assessmentId: number) {
  this.api.checkSubmission(userId, assessmentId).subscribe({
    next: (res: any) => {
      // res is your ApiResponse DTO
      if (res.success && res.data) {
        // If your backend returns a single object or a list of submissions:
        // We'll treat it as a single object for the "Latest" view 
        // and you can loop it if it's a list for history.
        this.submissionData = res.data;
        this.isAlreadySubmitted = true;
      } else {
        // success: false or data: null (e.g., 404 handled within a 200 OK)
        this.isAlreadySubmitted = false;
        this.submissionData = null;
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      // Catches actual HTTP errors (400, 404, 500)
      this.isAlreadySubmitted = false;
      this.submissionData = null;
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

goBack() {
  window.history.back();      
}
}