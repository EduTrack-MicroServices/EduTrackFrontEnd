import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../../core/services/assessment-service';

@Component({
  selector: 'app-assessment-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './assessment-create.html'
})
export class AssessmentCreateComponent implements OnInit {
  courseId!: number;
  questions: any[] = [];
  questionCount = 0;
  errorMessage = '';

  // Data model for adding a new question (matching your Java Entity)
  newQuestion = {
    courseId: 0,
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: ''
  };

  // Data model for the Assessment itself
  assessment = {
    courseId: 0,
    type: 'QUIZ',
    numberOfQuestions: 0,
    maxMarks: 0,
    dueDate: '',
    status: 'ASSIGNED'
  };

  constructor(
    private route: ActivatedRoute,
    private api: AssessmentService,
    private router: Router,
    private cdr: ChangeDetectorRef // Injected to fix UI refresh issue
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.assessment.courseId = this.courseId;
    this.newQuestion.courseId = this.courseId;
    this.loadQuestions();
  }

  loadQuestions() {
    this.api.getQuestionsByCourseId(this.courseId).subscribe({
      next: (res: any) => {
        this.questions = res.data || [];
        this.questionCount = this.questions.length;
        
        // This forces Angular to refresh the UI immediately
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error fetching questions:', err);
      }
    });
  }

  // VALIDATION: Prevents selecting more questions than available
  checkMaxQuestions() {
    if (this.assessment.numberOfQuestions > this.questionCount) {
      this.assessment.numberOfQuestions = this.questionCount;
      this.errorMessage = `Only ${this.questionCount} questions available in the bank.`;
    } else if (this.assessment.numberOfQuestions < 0) {
      this.assessment.numberOfQuestions = 0;
    } else {
      this.errorMessage = '';
    }
    this.updateMarks();
  }

  updateMarks() {
    // Logic: 1 Mark per question
    this.assessment.maxMarks = (this.assessment.numberOfQuestions || 0) * 1;
  }

  addQuestionToBank() {
    // Ensure all fields required by Java @NotBlank are filled
    if (!this.newQuestion.question || !this.newQuestion.answer || !this.newQuestion.option1) {
      this.errorMessage = "Please fill in all question fields and the correct answer.";
      return;
    }

    this.api.createQuestion(this.newQuestion).subscribe({
      next: () => {
        this.resetQuestionForm();
        this.loadQuestions(); // Refreshes list and questionCount
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = "Failed to save the question.";
      }
    });
  }

  resetQuestionForm() {
    this.newQuestion = {
      courseId: this.courseId,
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      answer: ''
    };
  }

  deleteQuestion(questionId: number) {
    if (confirm('Permanently delete this question from the bank?')) {
      this.api.deleteQuestion(questionId).subscribe(() => {
        this.loadQuestions();
      });
    }
  }

  createAssessment() {
    if (this.assessment.numberOfQuestions <= 0) {
      this.errorMessage = "Please select at least 1 question.";
      return;
    }
    if (!this.assessment.dueDate) {
      this.errorMessage = "Due date is required.";
      return;
    }

    this.api.createAssessment(this.assessment).subscribe(() => {
      this.router.navigate(['/courses', this.courseId]);
    });
  }
}