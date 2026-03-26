import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, PlatformLocation } from '@angular/common';
import { toast } from 'ngx-sonner'; // Import toast

@Component({
  standalone: true,
  selector: 'app-assessment-score',
  imports: [CommonModule, RouterLink],
  templateUrl: './assessment-score.html'
})
export class AssessmentScoreComponent implements OnInit {
  private router = inject(Router);
  private location = inject(PlatformLocation);

  score: number = 0;
  total: number = 0;
  passed: boolean = false;
  review: any[] = [];

  ngOnInit(): void {
    // 1. Disable the browser back button specifically for this session
    window.scrollTo(0, 0);
    this.location.onPopState(() => {
      this.router.navigate(['/dashboard']);
    });

    const state = history.state;
    if (state && state.score !== undefined) {
      this.score = state.score;
      this.total = state.total;
      this.passed = state.passed;
      this.review = state.review || [];

      // 2. Trigger Result Toasts
      this.showResultToast();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private showResultToast() {
    if (this.passed) {
      toast.success('Congratulations!', {
        description: `You passed with a score of ${this.score}/${this.total}.`,
      });
    } else {
      toast.error('Assessment Not Cleared', {
        description: `Your score: ${this.score}. Please review and try again.`,
      });
    }
  }
}