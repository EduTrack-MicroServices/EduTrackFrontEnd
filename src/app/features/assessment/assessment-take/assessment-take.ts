import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../../core/services/assessment-service';
import { AuthService } from '../../../core/services/auth';
import { toast } from 'ngx-sonner';

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
      error: () => {
        this.isLoading = false;
        toast.error('Failed to load quiz questions');
      },
    });
  }

  get isQuizComplete(): boolean {
    return (
      this.questions.length > 0 && Object.keys(this.userAnswers).length === this.questions.length
    );
  }

  private generateFeedback(score: number, total: number): string {
    const percentage = (score / total) * 100;

    if (percentage < 40) {
      return 'Bad, need to improve. Please review the course materials and try again.';
    } else if (percentage >= 40 && percentage < 70) {
      return 'Good, but there is still scope for improvement. Well done on passing!';
    } else if (percentage >= 70 && percentage < 90) {
      return 'Great job! You have a strong grasp of the material.';
    } else {
      return 'Excellent! You have mastered this course perfectly.';
    }
  }

  submitQuiz() {
    if (!this.isQuizComplete) {
      this.errorMessage = 'Please answer all mandatory questions.';
      toast.warning(this.errorMessage);
      return;
    }

    const userId = Number(localStorage.getItem('userId')) || this.auth.getUserId();

    if (!userId) {
      this.errorMessage = 'User session not found. Please log in again.';
      toast.error(this.errorMessage);
      return;
    }

    let totalPoints = 0;
    const totalQuestions = this.questions.length;

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

    const dynamicFeedback = this.generateFeedback(totalPoints, totalQuestions);

    const submissionData = {
      assessmentId: this.assessmentId,
      userId: userId,
      submittedDate: new Date().toISOString(),
      score: totalPoints,
      feedback: dynamicFeedback,
    };

    // Show loading toast for the submission process
    const loadingToast = toast.loading('Submitting your assessment...');

    this.api.checkSubmission(userId, this.assessmentId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const existingSubmissionId = res.data.submissionId;

          this.api.updateSubmission(existingSubmissionId, submissionData).subscribe({
            next: () => {
              toast.dismiss(loadingToast);
              toast.success('Assessment updated successfully');
              this.navigateToResult(totalPoints, reviewData, dynamicFeedback);
            },
            error: () => {
              toast.dismiss(loadingToast);
              this.errorMessage = 'Failed to update existing submission.';
              toast.error(this.errorMessage);
            },
          });
        } else {
          this.createNewSubmission(submissionData, totalPoints, reviewData, dynamicFeedback, loadingToast);
        }
      },
      error: () => {
        this.createNewSubmission(submissionData, totalPoints, reviewData, dynamicFeedback, loadingToast);
      },
    });
  }

  private createNewSubmission(data: any, score: number, review: any[], feedback: string, loadingId?: any) {
    this.api.createSubmission(data).subscribe({
      next: () => {
        if (loadingId) toast.dismiss(loadingId);
        toast.success('Assessment submitted successfully');
        this.navigateToResult(score, review, feedback);
      },
      error: () => {
        if (loadingId) toast.dismiss(loadingId);
        this.errorMessage = 'Failed to save submission.';
        toast.error(this.errorMessage);
      },
    });
  }

  private navigateToResult(score: number, review: any[], feedback: string) {
    this.router.navigate(['/courses', this.courseId, 'assessment', 'result'], {
      replaceUrl: true,
      state: {
        score: score,
        total: this.questions.length,
        passed: score >= this.questions.length * 0.4,
        review: review,
        feedback: feedback,
      },
    });
  }

  get answeredCount(): number {
    return Object.keys(this.userAnswers).length;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return (this.answeredCount / this.questions.length) * 100;
  }
}