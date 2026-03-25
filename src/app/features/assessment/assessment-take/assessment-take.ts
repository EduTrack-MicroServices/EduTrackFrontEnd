import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../../core/services/assessment-service';
import { AuthService } from '../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-assessment-take',
  imports: [FormsModule, CommonModule],
  templateUrl: './assessment-take.html',
  styles: [
    `
      .option-label {
        transition: all 0.2s;
        cursor: pointer;
        border: 1px solid #dee2e6;
      }
      .option-label:hover {
        background-color: #f8f9fa;
      }
      .btn-check:checked + .option-label {
        background-color: #e7f1ff !important;
        border-color: #0d6efd !important;
        color: #084298 !important;
        font-weight: 600;
      }
      .question-card {
        transition: border-left 0.3s ease;
      }
    `,
  ],
})
export class AssessmentTakeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(AssessmentService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  courseId!: number;
  assessmentId!: number;
  questions: any[] = [];
  userAnswers: { [key: number]: string } = {};
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.assessmentId = Number(this.route.snapshot.paramMap.get('assessmentId'));
    this.loadQuiz();
  }

  loadQuiz() {
    this.api.getQuizQuestions(this.courseId).subscribe({
      next: (res: any) => {
        this.questions = res.data || res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isLoading = false),
    });
  }

  get isQuizComplete(): boolean {
    return (
      this.questions.length > 0 && Object.keys(this.userAnswers).length === this.questions.length
    );
  }

  // Inside AssessmentTakeComponent class
  submitQuiz() {
    if (!this.isQuizComplete) {
      this.errorMessage = 'Please answer all mandatory questions.';
      return;
    }

    // 1. Get User ID from Local Storage (fallback to auth service if needed)
    const userId = Number(localStorage.getItem('userId')) || this.auth.getUserId();

    if (!userId) {
      this.errorMessage = "User session not found. Please log in again.";
      return;
    }

    // 2. Calculate score and build review data
    let totalPoints = 0;
    const reviewData = this.questions.map((q) => {
      const isCorrect = this.userAnswers[q.questionId] === q.answer;
      if (isCorrect) totalPoints++;
      return {
        question: q.question,
        userChoice: this.userAnswers[q.questionId],
        correctAnswer: q.answer,
        isCorrect: isCorrect,
      };
    });

    // 3. Prepare payload
    const submissionData = {
      assessmentId: this.assessmentId,
      userId: userId,
      submittedDate: new Date().toISOString(),
      score: totalPoints,
      feedback: `Attempt updated for Course ID: ${this.courseId}`,
    };

    // 4. Logic: Find existing submission first
    this.api.checkSubmission(userId, this.assessmentId).subscribe({
      next: (res: any) => {
        // If success is true and data exists, the user has submitted before
        if (res.success && res.data) {
          const existingSubmissionId = res.data.submissionId;
          
          this.api.updateSubmission(existingSubmissionId, submissionData).subscribe({
            next: () => this.navigateToResult(totalPoints, reviewData),
            error: () => this.errorMessage = "Failed to update existing submission."
          });
        } else {
          // If 200 OK but no data, create a new one
          this.createNewSubmission(submissionData, totalPoints, reviewData);
        }
      },
      error: (err) => {
        // If 404/Error, it means no previous record exists
        this.createNewSubmission(submissionData, totalPoints, reviewData);
      }
    });
  }

  // Helper: Logic for creating a new record
  private createNewSubmission(data: any, score: number, review: any[]) {
    this.api.createSubmission(data).subscribe({
      next: () => this.navigateToResult(score, review),
      error: () => this.errorMessage = "Failed to save submission."
    });
  }

  // Helper: Navigation logic
 // Inside AssessmentTakeComponent.ts

private navigateToResult(score: number, review: any[]) {
  this.router.navigate(['/courses', this.courseId, 'assessment', 'result'], {
    // replaceUrl: true prevents the user from going "Back" into the quiz
    replaceUrl: true, 
    state: {
      score: score,
      total: this.questions.length,
      passed: score >= (this.questions.length * 0.4),
      review: review
    },
  });
}
  // Inside your AssessmentTakeComponent class

  /** Returns the number of questions answered so far */
  get answeredCount(): number {
    return Object.keys(this.userAnswers).length;
  }

  /** Returns the progress as a percentage (0 to 100) */
  get progress(): number {
    if (this.questions.length === 0) return 0;
    return (this.answeredCount / this.questions.length) * 100;
  }
}
