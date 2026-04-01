import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CourseService } from '../../../core/services/course-service';
import { AuthService } from '../../../core/services/auth';
import { Program } from '../../../core/models/course';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast
import { EnrollmentService } from '../../../core/services/enrollment-service';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-program-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './program-list.html',
  styleUrl: './program-list.css',
})
export class ProgramListComponent implements OnInit {
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  isLoading = signal<boolean>(true);

  private enrollmentService = inject(EnrollmentService);

  programs = signal<Program[]>([]);

  isEditor = computed(() => {
    const role = this.authService.userRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms() {
    this.isLoading.set(true);
    this.courseService.getAllPrograms().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) this.programs.set(res.data);
      },
      error: () => {
        toast.error('Failed to load programs', {
          description: 'Could not fetch the program list from the server.'
        });
      }
    });
  }

  // Logic for the Delete button
  onDelete(id: number) {
    toast.warning('Delete this program?', {
      description: 'This will permanently remove the program and all student enrollments.',
      action: {
        label: 'Confirm Delete',
        onClick: () => {
          // 1. Fetch all enrollments for this program
          this.enrollmentService.getEnrollmentsByProgram(id).pipe(
            switchMap((res) => {
              const enrollments = res.data || [];

              if (enrollments.length > 0) {
                // 2. If enrollments exist, create an array of delete requests
                const deleteRequests = enrollments.map(e =>
                  this.enrollmentService.deleteEnrollment(e.enrollmentId)
                );
                // forkJoin executes all delete calls in parallel
                return forkJoin(deleteRequests);
              }

              // If no enrollments, just move to the next step
              return of(null);
            }),
            // 3. After enrollments are deleted, delete the program itself
            switchMap(() => this.courseService.deleteProgram(id))
          ).subscribe({
            next: () => {
              toast.success('Program Deleted', {
                description: 'Program and associated records removed.',
              });
              this.loadPrograms(); // Refresh the UI list
            },
            error: (err) => {
              console.error(err);
              toast.error('Deletion Failed', {
                description: 'An error occurred during the cleanup process.'
              });
            }
          });
        }
      },
      cancel: { label: 'Cancel', onClick: () => { } }
    });
  }
}