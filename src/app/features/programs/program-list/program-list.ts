import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CourseService } from '../../../core/services/course-service';
import { AuthService } from '../../../core/services/auth';
import { Program } from '../../../core/models/course';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast

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
    // Action Toast replacing the confirm() dialog
    toast.warning('Delete this program?', {
      description: 'Are you sure? This action cannot be undone and will affect enrolled students.',
      action: {
        label: 'Delete',
        onClick: () => {
          this.courseService.deleteProgram(id).subscribe({
            next: () => {
              toast.success('Program Deleted', {
                description: 'The program has been successfully removed.',
                duration: 3000
              });
              this.loadPrograms(); // Refresh list
            },
            error: (err) => {
              const backendErrors = err.error?.errors || err.error?.message;
              const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'An error occurred while deleting.');
              toast.error('Deletion Failed', { description: errorMessage });
            }
          });
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          // Do nothing, just dismiss the toast
        }
      }
    });
  }
}