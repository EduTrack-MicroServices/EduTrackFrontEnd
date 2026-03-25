import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Program } from '../../../core/models/course';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast

@Component({
  selector: 'app-program-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './program-form.html',
  styleUrl: './program-form.css',
})
export class ProgramFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  programId: number | null = null;
  isEditMode = false;

  // Form matches your Program Entity exactly
  programForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.required],
    durationWeeks: [1, [Validators.required, Validators.min(1)]],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit() {
    // Check if there is an ID in the URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.programId = Number(id);
      this.isEditMode = true;
      this.loadProgramForEdit(this.programId);
    }
  }

  loadProgramForEdit(id: number) {
    this.courseService.getProgramById(id).subscribe({
      next: (res) => {
        if (res.success) {
          // Fill the form with existing data
          this.programForm.patchValue(res.data);
        }
      },
      error: () => {
        toast.error('Failed to load program details');
      }
    });
  }

  onSubmit() {
    if (this.programForm.valid) {
      const programData = this.programForm.value as Program;

      if (this.isEditMode && this.programId) {
        // UPDATE Logic
        this.courseService.updateProgram(this.programId, programData).subscribe({
          next: () => this.handleSuccess('Program Updated Successfully!'),
          error: (err) => {
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Update failed');
            toast.error('Failed to update program', { description: errorMessage });
          }
        });
      } else {
        // CREATE Logic
        this.courseService.createProgram(programData).subscribe({
          next: () => this.handleSuccess('Program Created Successfully!'),
          error: (err) => {
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Creation failed');
            toast.error('Failed to create program', { description: errorMessage });
          }
        });
      }
    } else {
      // Form Validation Fallback
      toast.warning('Invalid Form', { 
        description: 'Please ensure all required fields are filled out correctly.' 
      });
    }
  }

  onCancel() {
    this.router.navigate(['/program-list']);
  }
  private handleSuccess(msg: string) {
    toast.success(msg, { duration: 3000 }); // Show success toast instead of alert()
    this.router.navigate(['/program-list']); 
  }
}