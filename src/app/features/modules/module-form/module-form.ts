import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Module } from '../../../core/models/course';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast

@Component({
  selector: 'app-module-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './module-form.html',
  styleUrl: './module-form.css',
})
export class ModuleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  moduleId: number | null = null;
  courseId: number | null = null;
  programId: number | null = null;

  isEditMode = false;

  moduleForm = this.fb.group({
    name: ['', Validators.required],
    sequenceOrder: [1, [Validators.required, Validators.min(1)]],
    learningObjectives: ['', Validators.required]
  });

  ngOnInit() {
    const mId = this.route.snapshot.paramMap.get('moduleId');
    const cId = this.route.snapshot.paramMap.get('courseId');
    this.programId = +this.route.snapshot.paramMap.get('programId')!;

    if (mId) {
      this.moduleId = +mId;
      this.isEditMode = true;
      this.loadModuleData(this.moduleId);
    } else if (cId) {
      this.courseId = +cId;
    }
  }

  loadModuleData(id: number) {
    this.courseService.getModuleById(id).subscribe({
      next: (res) => {
        if (res.success) this.moduleForm.patchValue(res.data);
      },
      error: () => {
        toast.error('Failed to load module details');
      }
    });
  }

  onSubmit() {
    if (this.moduleForm.valid) {
      const moduleData = this.moduleForm.value as Module;

      if (this.isEditMode && this.moduleId) {
        // UPDATE: PUT /api/modules/{moduleId}
        this.courseService.updateModule(this.moduleId, moduleData).subscribe({
          next: () => this.handleSuccess('Module updated successfully!'),
          error: (err) => {
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Update failed');
            toast.error('Failed to update module', { description: errorMessage });
          }
        });
      } else if (this.courseId) {
        // CREATE: POST /api/courses/{courseId}/modules
        this.courseService.addModule(this.courseId, moduleData).subscribe({
          next: () => this.handleSuccess('Module added to course!'),
          error: (err) => {
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Creation failed');
            toast.error('Failed to create module', { description: errorMessage });
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
  window.history.back();
}
  
  private handleSuccess(msg: string) {
    toast.success(msg, { duration: 3000 }); // Show success toast instead of alert()
    
    // If we have courseId, go back to course details, otherwise go to dashboard
    if (this.courseId) {
      this.router.navigate(['/programs', this.programId, 'courses', this.courseId]);
    } else {
      window.history.back(); // Simple way to return to previous page
    }
  }
}