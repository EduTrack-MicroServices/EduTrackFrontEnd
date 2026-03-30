import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../../core/services/assessment-service';
import { toast } from 'ngx-sonner'; // Import toast

@Component({
  selector: 'app-assessment-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './assessment-create.html',
})
export class AssessmentCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(AssessmentService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  bulkJsonInput = new FormControl('');
  isBulkMode = false; // Toggle for the UI

  today = new Date().toISOString().split('T')[0];
  courseId!: number;
  programId!: number;
  assessmentId: number | null = null;
  isEditMode = false;

  questions: any[] = [];
  questionCount = 0;
  readonly REQUIRED_COUNT = 10;

  // Feedback/Error states
  bankMessage = '';
  serverErrorMessage = '';

  // Assessment Form
  assessmentForm = new FormGroup({
    courseId: new FormControl(0),
    type: new FormControl('QUIZ'),
    numberOfQuestions: new FormControl({ value: 10, disabled: true }),
    maxMarks: new FormControl({ value: 10, disabled: true }),
    dueDate: new FormControl('', [Validators.required]),
    status: new FormControl('ASSIGNED'),
  });

  // Question Form
  questionForm = new FormGroup({
    courseId: new FormControl(0),
    question: new FormControl('', Validators.required),
    option1: new FormControl('', Validators.required),
    option2: new FormControl('', Validators.required),
    option3: new FormControl(''),
    option4: new FormControl(''),
    answer: new FormControl('', Validators.required),
  });

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.programId = Number(this.route.snapshot.paramMap.get('programId'));
    const aId = this.route.snapshot.paramMap.get('assessmentId');

    this.assessmentForm.patchValue({ courseId: this.courseId });
    this.questionForm.patchValue({ courseId: this.courseId });

    if (aId) {
      this.isEditMode = true;
      this.assessmentId = Number(aId);
      this.loadExistingAssessment();
    }

    this.loadQuestions();
  }

  loadExistingAssessment() {
    if (!this.assessmentId) return;

    this.api.getAssessmentById(this.assessmentId).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.assessmentForm.patchValue({
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
          status: data.status,
          type: data.type || 'QUIZ'
        });
        this.cdr.detectChanges();
      },
      error: () => {
        toast.error('Failed to load assessment details');
      }
    });
  }

  loadQuestions() {
    this.api.getQuestionsByCourseId(this.courseId).subscribe({
      next: (res: any) => {
        this.questions = res.data || res || [];
        this.questionCount = this.questions.length;
        this.updateBankStatus();
        this.cdr.detectChanges();
      },
      error: () => toast.error('Error loading question bank'),
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
      toast.warning('Please fill in all required question fields');
      return;
    }

    this.api.createQuestion(this.questionForm.value).subscribe({
      next: () => {
        toast.success('Question added to bank');
        this.questionForm.reset({ courseId: this.courseId });
        this.loadQuestions();
      },
      error: (err) => toast.error(err.error?.message || 'Error saving question'),
    });
  }

  deleteQuestion(id: number) {
    this.api.deleteQuestion(id).subscribe({
      next: () => {
        toast.success('Question deleted successfully');
        this.loadQuestions();
      },
      error: () => toast.error('Failed to delete question')
    });
  }

  submitAssessment() {
    this.serverErrorMessage = '';
    const selectedDate = this.assessmentForm.get('dueDate')?.value;

    if (selectedDate && selectedDate < this.today) {
      toast.error('Due date cannot be in the past');
      return;
    }

    if (this.questionCount < this.REQUIRED_COUNT) {
      toast.error(`Incomplete Bank: Need ${this.REQUIRED_COUNT} questions`);
      return;
    }

    const payload = this.assessmentForm.getRawValue();

    if (this.isEditMode && this.assessmentId) {
      this.api.updateAssessment(this.assessmentId, payload).subscribe({
        next: () => {
          toast.success('Assessment updated successfully');
         window.history.back();
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.api.createAssessment(payload).subscribe({
        next: () => {
          toast.success('Assessment created successfully');
        window.history.back();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any) {
    this.serverErrorMessage = err.error?.message || 'A server error occurred.';
    toast.error(this.serverErrorMessage);
    this.cdr.detectChanges();
  }

  goBack(){
    window.history.back()
  }

  submitBulkQuestions() {
    const rawValue = this.bulkJsonInput.value;
    if (!rawValue || rawValue.trim() === '') {
      toast.warning('Please paste JSON data first');
      return;
    }

    try {
      // Parse the string into a JSON array
      const questionsArray = JSON.parse(rawValue);

      if (!Array.isArray(questionsArray)) {
        toast.error('Data must be an array of questions [{}, {}]');
        return;
      }

      // Automatically attach the current courseId to every question in the array
      const sanitizedQuestions = questionsArray.map(q => ({
        ...q,
        courseId: this.courseId
      }));

      this.api.bulkCreateQuestions(sanitizedQuestions).subscribe({
        next: (res) => {
          toast.success(`${sanitizedQuestions.length} questions added successfully!`);
          this.bulkJsonInput.reset();
          this.loadQuestions(); // Refresh the list below
          this.isBulkMode = false; // Switch back to normal view
        },
        error: (err) => {
          this.serverErrorMessage = err.error?.message || 'Bulk upload failed. Check JSON format.';
          toast.error('Bulk Upload Failed');
        }
      });
    } catch (e) {
      toast.error('Invalid JSON format. Please check your syntax.');
    }
  }

  toggleBulkMode() {
    this.isBulkMode = !this.isBulkMode;
  }

}