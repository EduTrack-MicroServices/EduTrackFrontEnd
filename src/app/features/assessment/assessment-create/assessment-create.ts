import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../../core/services/assessment-service';

@Component({
  selector: 'app-assessment-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './assessment-create.html'
})
export class AssessmentCreateComponent implements OnInit {
  courseId!: number;
  questions: any[] = [];
  questionCount = 0;
  
  // Error handling states
  bankMessage = '';       // For "need more questions" logic
  serverErrorMessage = ''; // For backend validation (e.g., past date)

  readonly REQUIRED_COUNT = 10;

  // Assessment Form - Static values are 'disabled' so they can't be edited
  assessmentForm = new FormGroup({
    courseId: new FormControl(0),
    type: new FormControl('QUIZ'),
    numberOfQuestions: new FormControl({ value: 10, disabled: true }),
    maxMarks: new FormControl({ value: 10, disabled: true }),
    dueDate: new FormControl('', [Validators.required]),
    status: new FormControl('ASSIGNED')
  });

  // Question Form
  questionForm = new FormGroup({
    courseId: new FormControl(0),
    question: new FormControl('', Validators.required),
    option1: new FormControl('', Validators.required),
    option2: new FormControl('', Validators.required),
    option3: new FormControl(''),
    option4: new FormControl(''),
    answer: new FormControl('', Validators.required)
  });

  constructor(
    private route: ActivatedRoute,
    private api: AssessmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    
    // Initialize forms with current course context
    this.assessmentForm.patchValue({ courseId: this.courseId });
    this.questionForm.patchValue({ courseId: this.courseId });

    this.loadQuestions();
  }

  loadQuestions() {
    this.api.getQuestionsByCourseId(this.courseId).subscribe({
      next: (res: any) => {
        this.questions = res.data || [];
        this.questionCount = this.questions.length;
        this.updateBankStatus();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Bank Load Error:', err)
    });
  }

  updateBankStatus() {
    if (this.questionCount < this.REQUIRED_COUNT) {
      this.bankMessage = `Add ${this.REQUIRED_COUNT - this.questionCount} more questions to enable saving.`;
    } else {
      this.bankMessage = '';
    }
  }

  addQuestionToBank() {
    if (this.questionForm.invalid) {
      alert("Please fill in the Question, Option 1, Option 2, and the Answer.");
      return;
    }

    this.api.createQuestion(this.questionForm.value).subscribe({
      next: () => {
        this.questionForm.reset({ courseId: this.courseId });
        this.loadQuestions();
      },
      error: (err) => alert("Error saving question: " + (err.error?.message || 'Check connection'))
    });
  }

  deleteQuestion(id: number) {
    if (confirm('Delete this question?')) {
      this.api.deleteQuestion(id).subscribe(() => this.loadQuestions());
    }
  }

  createAssessment() {
    this.serverErrorMessage = ''; // Reset errors on new attempt

    if (this.questionCount < this.REQUIRED_COUNT) return;

    // Use .getRawValue() to include 'disabled' fields like numberOfQuestions
    const payload = this.assessmentForm.getRawValue();

    this.api.createAssessment(payload).subscribe({
      next: () => {
        this.router.navigate(['/courses', this.courseId]);
      },
      error: (err) => {
        // This captures the "Due date cannot be in the past" from your Java backend
        this.serverErrorMessage = err.error?.message || "Server error occurred.";
      }
    });
  }
}