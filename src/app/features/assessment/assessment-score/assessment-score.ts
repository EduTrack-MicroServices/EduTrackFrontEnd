import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, PlatformLocation } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-assessment-score',
  imports: [CommonModule, RouterLink],
  templateUrl: './assessment-score.html'
})
export class AssessmentScoreComponent implements OnInit {
  private router = inject(Router);
  private location = inject(PlatformLocation); // Used to detect back button

  score: number = 0;
  total: number = 0;
  passed: boolean = false;
  review: any[] = [];

  ngOnInit(): void {
    // 1. Disable the browser back button specifically for this session
    window.scrollTo(0, 0);
    this.location.onPopState(() => {
      // If they try to go back, force them to the dashboard
      this.router.navigate(['/dashboard']);
    });

    const state = history.state;
    if (state && state.score !== undefined) {
      this.score = state.score;
      this.total = state.total;
      this.passed = state.passed;
      this.review = state.review || [];
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}