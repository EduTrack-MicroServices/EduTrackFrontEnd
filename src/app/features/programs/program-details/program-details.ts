import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Program, Course } from '../../../core/models/course';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment-service';
import { EnrollmentRequest } from '../../../core/models/enrollment';
import { toast } from 'ngx-sonner'; 
import { ProgramProgressResponse } from '../../../core/models/progress';
import { CertificateComponent } from '../../certificate/certificate';

@Component({
  selector: 'app-program-details',
  standalone: true, // Ensure standalone is true if using imports array
  imports: [CommonModule, RouterLink, CertificateComponent], // Added CertificateComponent here
  templateUrl: './program-details.html',
  styleUrl: './program-details.css',
})
export class ProgramDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  public authService = inject(AuthService); // Changed to public to access in HTML
  private enrollmentService = inject(EnrollmentService);
  private router = inject(Router);

  @ViewChild('certGenerator') certGenerator!: CertificateComponent;

  isLoading = signal<boolean>(true);
  isEnrolled = signal<boolean>(false);
  program = signal<Program | null>(null);
  courses = signal<Course[]>([]);
  programId!: number;
  progress = signal<ProgramProgressResponse | null>(null);
  selectedProgramName: string = '';
  today = new Date();

  // Computed properties
  canEnroll = computed(() => {
    return this.courses().length > 0 && this.program()?.status === 'ACTIVE';
  });

  isEditor = computed(() => {
    const role = this.authService.userRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });

  ngOnInit() {
    this.programId = Number(this.route.snapshot.paramMap.get('id'));

    
    this.authService.fetchUserDetails();

    console.log('User name:', this.authService.getUserName()); // Debugging line
    if (this.programId) {
      this.checkStatus();
      this.loadData();
      this.loadProgress();
    }
  }

  loadData() {
    this.isLoading.set(true);
    this.courseService.getProgramById(this.programId).subscribe({
      next: (res) => {
        if (res.success) {
          this.program.set(res.data);
          this.selectedProgramName = res.data.name; // Pre-set for certificate
        }
      }
    });

    this.courseService.getCoursesByProgram(this.programId).subscribe({
      next: (res) => {
        if (res.success) this.courses.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadProgress() {
    const userId = this.authService.getUserId();
    if (userId && userId !== 0 && !this.isEditor()) {
      this.courseService.getProgramProgress(this.programId, userId).subscribe({
        next: (res) => {
          if (res.success) {
            this.progress.set(res.data);
          }
        }
      });
    }
  }

  checkStatus() {
    const userId = this.authService.getUserId();
    if (userId && userId !== 0) {
      this.enrollmentService.checkEnrollmentExists(userId, this.programId).subscribe(exists => {
        this.isEnrolled.set(exists);
      });
    }
  }

  onEnroll() {
    const userId = this.authService.getUserId();
    if (!userId || userId === 0) {
      toast.error('Session Expired', { description: 'Please login to enroll.' });
      this.router.navigate(['/login']);
      return;
    }

    const request: EnrollmentRequest = { programId: this.programId, userId: userId };
    this.enrollmentService.createEnrollment(request).subscribe({
      next: (res) => {
        if (res.success) {
          toast.success('Enrolled successfully!');
          this.isEnrolled.set(true);
        }
      },
      error: (err) => toast.error('Enrollment Failed', { description: err.error?.message })
    });
  }


  

  // FIXED: Logic for downloading the certificate
  downloadCertificate() {
    if (!this.progress()?.programCompleted) {
      toast.error('Requirement not met', { description: 'Finish all courses to unlock the certificate.' });
      return;
    }

    // Program name is already in this.selectedProgramName from loadData()
    setTimeout(() => {
      this.certGenerator.downloadPDF();
      toast.success('Certificate generated successfully!');
    }, 100);
  }

  onDeleteCourse(courseId: number) {
    toast.warning('Delete this course?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => {
          this.courseService.deleteCourse(courseId).subscribe({
            next: () => {
              toast.success('Course Deleted');
              this.loadData();
            },
            error: (err) => toast.error('Delete failed', { description: err.error?.message })
          });
        }
      }
    });
  }
}