import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment-service';
import { Assessment } from '../../../core/models/assessment';
import { Submission } from '../../../core/models/submission';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth'; 
import { toast } from 'ngx-sonner'; // Import toast

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
        this.isLoading = false;
        toast.error('Could not load assessment details', {
          description: 'Please try again later or contact your instructor.'
        });
        this.cdr.detectChanges();
      }
    });
  }

  private verifyUserSubmission(userId: number, assessmentId: number) {
    this.api.checkSubmission(userId, assessmentId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.submissionData = res.data;
          this.isAlreadySubmitted = true;
          // Optional: Subtle notification that they've already completed this
          toast.info('You have already submitted this assessment.');
        } else {
          this.isAlreadySubmitted = false;
          this.submissionData = null;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isAlreadySubmitted = false;
        this.submissionData = null;
        this.isLoading = false;
        // Logic error on submission check usually shouldn't block the view, 
        // but we notify the user if the check fails.
        toast.error('Error checking submission status');
        this.cdr.detectChanges();
      }
    });
  }
}