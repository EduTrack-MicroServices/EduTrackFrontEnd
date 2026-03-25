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
  styles: [`
    .option-label { transition: all 0.2s; cursor: pointer; border: 1px solid #dee2e6; }
    .option-label:hover { background-color: #f8f9fa; }
    .btn-check:checked + .option-label { 
      background-color: #e7f1ff !important; 
      border-color: #0d6efd !important; 
      color: #084298 !important; 
      font-weight: 600;
    }
    .question-card { transition: border-left 0.3s ease; }
  `]
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
      error: () => this.isLoading = false
    });
  }

  get isQuizComplete(): boolean {
    return this.questions.length > 0 && Object.keys(this.userAnswers).length === this.questions.length;
  }

  // Inside AssessmentTakeComponent class

submitQuiz() {
  if (!this.isQuizComplete) {
    this.errorMessage = "Please answer all mandatory questions.";
    return;
  }

  // Calculate score
  let totalPoints = 0;
  this.questions.forEach(q => {
    if (this.userAnswers[q.questionId] === q.answer) {
      totalPoints++;
    }
  });

  // Prepare payload to match Java Submission Entity
  const submissionData = {
    assessmentId: this.assessmentId, // Matching private Long assessmentId
    userId: this.auth.getUserId(),               // Matching private Long userId
    submittedDate: new Date().toISOString(),     // Matching LocalDateTime (ISO String)
    score: totalPoints,                          // Matching private double score
    feedback: `Completed assessment for Course ID: ${this.courseId}` // Optional feedback string
  };

  this.api.createSubmission(submissionData).subscribe({
    next: (res) => {
      console.log('Submission saved:', res);
      this.router.navigate(['/courses', this.courseId, 'assessment', 'result'], {
        state: { 
          score: totalPoints, 
          total: this.questions.length,
          passed: totalPoints >= (this.questions.length * 0.4)
        }
      });
    },
    error: (err) => {
      this.errorMessage = "Failed to submit. Please check your connection.";
      console.error(err);
    }
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