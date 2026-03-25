import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- ADDED: Allows us to link to other pages
import { AnalysisService } from '../../core/services/analysis';
import { AuthService } from '../../core/services/auth';
import { Submission } from '../../core/models/submission';
import { toast } from 'ngx-sonner';
import { BaseChartDirective } from 'ng2-charts';

import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js'; 
Chart.register(...registerables);

@Component({
  selector: 'app-analysispage',
  // <-- ADDED RouterLink to the imports array below
  imports: [CommonModule, BaseChartDirective, RouterLink], 
  templateUrl: './analysispage.html',
  styleUrl: './analysispage.css',
})
export class Analysispage implements OnInit {
  private authService = inject(AuthService);
  private analysisService = inject(AnalysisService);

  isLoading = signal<boolean>(true);
  userId = 0; 

  submissions = signal<Submission[]>([]);
  averageScore = signal<number>(0);
  highestScore = signal<number>(0);
  bestTopic = signal<string>('N/A');
  isTableVisible = signal<boolean>(true);

  private courseLabels = [
    'Java Core', 'Spring Boot', 'Java DB',
    'React.js', 'Node.js', 'MongoDB',
    'HTML/CSS', 'TypeScript', 'Angular',
    'Python', 'FastAPI', 'React-Py',
    'LLMs', 'Prompt Eng', 'AI Agents'
  ];

  private colors = {
    emerald: '#10b981', 
    amber: '#f59e0b',   
    rose: '#ef4444',    
    gridLines: '#e2e8f0'
  };

  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = { datasets: [], labels: this.courseLabels };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { min: 0, max: 10, grid: { color: this.colors.gridLines }, border: { dash: [4, 4] } },
      x: { grid: { display: false } }
    }
  };

  public doughnutChartType: 'doughnut' = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = { datasets: [], labels: ['Excellent (8-10)', 'Pass (5-7)', 'Review (<5)'] };
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false,
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
    this.analysisService.getAllSubmissionById(this.userId).subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          const sortedData = res.data.sort((a, b) => a.assessmentId - b.assessmentId);
          const dateSorted = [...res.data].sort((a, b) => 
            new Date(b.submittedDate!).getTime() - new Date(a.submittedDate!).getTime()
          );
          
          this.submissions.set(dateSorted);
          const scores = sortedData.map(sub => sub.score);
          
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          this.averageScore.set(Number(avg.toFixed(1)));
          
          const max = Math.max(...scores);
          this.highestScore.set(max);

          const bestIndex = scores.indexOf(max);
          this.bestTopic.set(this.courseLabels[bestIndex] || 'N/A');

          this.populateChartData(scores);
        }
        setTimeout(() => this.isLoading.set(false), 600);
      },
      error: () => {
        toast.error('Data Sync Failed', { description: 'Could not load your learning analytics.' });
        this.isLoading.set(false);
      }
    });
  }

  populateChartData(scores: number[]) {
    this.barChartData.datasets = [{
      data: scores,
      backgroundColor: scores.map(s => s >= 8 ? this.colors.emerald : (s >= 5 ? this.colors.amber : this.colors.rose)),
      borderRadius: 6,
      barPercentage: 0.6
    }];

    const excellentCount = scores.filter(s => s >= 8).length;
    const passCount = scores.filter(s => s >= 5 && s < 8).length;
    const reviewCount = scores.filter(s => s < 5).length;

    this.doughnutChartData.datasets = [{
      data: [excellentCount, passCount, reviewCount],
      backgroundColor: [this.colors.emerald, this.colors.amber, this.colors.rose],
      borderWidth: 0, 
      hoverOffset: 4
    }];
  }

  toggleTable() {
    this.isTableVisible.update(v => !v);
  }
}