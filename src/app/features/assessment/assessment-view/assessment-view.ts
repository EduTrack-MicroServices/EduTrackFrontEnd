import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment-service';
import { Assessment } from '../../../core/models/assessment';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth'; // Ensure path is correct

@Component({
  standalone: true,
  selector: 'app-assessment-view',
  imports: [CommonModule, RouterLink], 
  templateUrl: './assessment-view.html',
  styleUrls: ['./assessment-view.css'] // Optional: for custom styling
})
export class AssessmentViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(AssessmentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  courseId!: number;
  assessment: Assessment | null = null;
  isLoading = true;

  // Check if current user is an instructor/admin
  isEditor = (): boolean => {
    const role = this.authService.userRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  };
ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('courseId');
  this.courseId = Number(idParam);

  // Calling the specific endpoint for this course
  this.api.getAssessmentByCourseId(this.courseId).subscribe({
    next: (res: any) => {
      // Check if data is wrapped in a 'data' property or returned directly
      this.assessment = res?.data ? res.data : res;
      
      console.log('Assessment Loaded:', this.assessment);
      this.isLoading = false; 
      this.cdr.detectChanges(); // Ensures UI updates immediately
    },
    error: (err) => {
      console.error('Error loading assessment', err);
      this.assessment = null; // Ensure state is clean on error
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}
}