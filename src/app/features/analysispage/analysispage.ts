import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/services/analysis';
import { AuthService } from '../../core/services/auth';
import { AssessmentService } from '../../core/services/assessment-service';
import { CourseService } from '../../core/services/course-service';
import { Submission } from '../../core/models/submission';
import { toast } from 'ngx-sonner';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin, map, switchMap, of, catchError } from 'rxjs';

import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js'; 
Chart.register(...registerables);

interface DetailedSubmission extends Submission {
  courseName: string;
}

@Component({
  selector: 'app-analysispage',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink], 
  templateUrl: './analysispage.html',
  styleUrl: './analysispage.css',
})
export class Analysispage implements OnInit {
  private authService = inject(AuthService);
  private analysisService = inject(AnalysisService);
  private assessmentService = inject(AssessmentService);
  private courseService = inject(CourseService);

  isLoading = signal<boolean>(true);
  userId = 0; 
  submissions = signal<DetailedSubmission[]>([]);
  averageScore = signal<number>(0);
  highestScore = signal<number>(0);
  bestTopic = signal<string>('N/A');
  isTableVisible = signal<boolean>(true);

  private colors = {
    emerald: '#10b981', 
    amber: '#f59e0b',   
    rose: '#ef4444',    
    gridLines: '#e2e8f0'
  };

  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = { datasets: [], labels: [] };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { min: 0, max: 10, grid: { color: this.colors.gridLines }, border: { dash: [4, 4] } },
      x: { grid: { display: false } }
    }
  };

  public doughnutChartType: 'doughnut' = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = { 
    datasets: [], 
    labels: ['Excellent (8-10)', 'Pass (5-7)', 'Review (<5)'] 
  };
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', 
    plugins: { 
      legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
      tooltip: { padding: 12, bodyFont: { size: 14, weight: 'bold' } }
    }
  };

  ngOnInit() {
    this.userId = this.authService.getUserId();
    if (this.userId === 0) {
      toast.error('Session Expired', { description: 'Please log in to view your analysis.' });
      this.isLoading.set(false);
      return;
    }
    this.loadAnalysisData();
  }

  loadAnalysisData() {
    this.analysisService.getAllSubmissionById(this.userId).pipe(
      switchMap(res => {
        if (res && res.data && res.data.length > 0) {
          const detailCalls = res.data.map(sub => 
            this.assessmentService.getAssessmentById(sub.assessmentId).pipe(
              switchMap(assessRes => {
                // Get courseId from nested data property
                const courseId = assessRes.data?.courseId;

                if (!courseId) {
                  return of({ ...sub, courseName: `Assessment ${sub.assessmentId}` } as DetailedSubmission);
                }

                return this.courseService.getCourseById(courseId).pipe(
                  map(courseRes => ({
                    ...sub,
                    // FIX: access name through courseRes.data
                    courseName: courseRes.data?.name || 'Unknown Course'
                  } as DetailedSubmission)),
                  catchError(() => of({ ...sub, courseName: 'Course Error' } as DetailedSubmission))
                );
              }),
              catchError(() => of({ ...sub, courseName: 'Assessment Error' } as DetailedSubmission))
            )
          );
          return forkJoin(detailCalls);
        }
        return of([]);
      })
    ).subscribe({
      next: (detailedList: DetailedSubmission[]) => {
        if (detailedList.length > 0) {
          const dateSorted = [...detailedList].sort((a, b) => 
            new Date(b.submittedDate!).getTime() - new Date(a.submittedDate!).getTime()
          );
          
          this.submissions.set(dateSorted);

          const scores = detailedList.map(s => s.score);
          const labels = detailedList.map(s => s.courseName);
          
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          this.averageScore.set(Number(avg.toFixed(1)));
          
          const max = Math.max(...scores);
          this.highestScore.set(max);

          const bestSub = detailedList.find(s => s.score === max);
          this.bestTopic.set(bestSub?.courseName || 'N/A');

          this.populateChartData(scores, labels);
        }
        setTimeout(() => this.isLoading.set(false), 600);
      },
      error: (err) => {
        console.error('Analysis error:', err);
        toast.error('Sync Failed');
        this.isLoading.set(false);
      }
    });
  }

  populateChartData(scores: number[], labels: string[]) {
    this.barChartData = {
      labels: labels,
      datasets: [{
        data: scores,
        backgroundColor: scores.map(s => s >= 8 ? this.colors.emerald : (s >= 5 ? this.colors.amber : this.colors.rose)),
        borderRadius: 6,
        barPercentage: 0.6
      }]
    };

    const excellentCount = scores.filter(s => s >= 8).length;
    const passCount = scores.filter(s => s >= 5 && s < 8).length;
    const reviewCount = scores.filter(s => s < 5).length;

    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [{
        data: [excellentCount, passCount, reviewCount],
        backgroundColor: [this.colors.emerald, this.colors.amber, this.colors.rose],
        borderWidth: 0, 
        hoverOffset: 4
      }]
    };
  }

  toggleTable() {
    this.isTableVisible.update(v => !v);
  }
}