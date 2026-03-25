import { Component } from '@angular/core';

@Component({
  standalone: true,
  templateUrl: './assessment-score.html'
})
export class AssessmentScoreComponent {

  score = history.state.score;
  total = history.state.totalMarks;

}