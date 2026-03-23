import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CourseService } from '../../../core/services/course-service';
import { AuthService } from '../../../core/services/auth';
import { Program } from '../../../core/models/course';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-program-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './program-list.html',
  styleUrl: './program-list.css',
})
export class ProgramListComponent implements OnInit {
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  
  programs = signal<Program[]>([]);
  
  
  isEditor = computed(() => {
    const role = this.authService.userRole();
    return role === 'ADMIN' || role === 'INSTRUCTOR';
  });

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms() {
    this.courseService.getAllPrograms().subscribe({
      next: (res) => { if (res.success) this.programs.set(res.data); }
    });
  }

  // Logic for the Delete button
  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this program?')) {
      this.courseService.deleteProgram(id).subscribe(() => {
        alert('Program Deleted');
        this.loadPrograms(); // Refresh list
      });
    }
  }
}
