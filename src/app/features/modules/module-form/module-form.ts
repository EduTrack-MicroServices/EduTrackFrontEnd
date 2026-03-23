import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Module } from '../../../core/models/course';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';

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
  isEditMode = false;

  moduleForm = this.fb.group({
    name: ['', Validators.required],
    sequenceOrder: [1, [Validators.required, Validators.min(1)]],
    learningObjectives: ['', Validators.required]
  });

  ngOnInit() {
    const mId = this.route.snapshot.paramMap.get('moduleId');
    const cId = this.route.snapshot.paramMap.get('courseId');

    if (mId) {
      this.moduleId = +mId;
      this.isEditMode = true;
      this.loadModuleData(this.moduleId);
    } else if (cId) {
      this.courseId = +cId;
    }
  }

  loadModuleData(id: number) {
    this.courseService.getModuleById(id).subscribe(res => {
      if (res.success) this.moduleForm.patchValue(res.data);
    });
  }

  onSubmit() {
    if (this.moduleForm.valid) {
      const moduleData = this.moduleForm.value as Module;

      if (this.isEditMode && this.moduleId) {
        // UPDATE: PUT /api/modules/{moduleId}
        this.courseService.updateModule(this.moduleId, moduleData).subscribe({
          next: () => this.handleSuccess('Module updated successfully'),
          error: (err) => alert(err.error?.message || 'Update failed')
        });
      } else if (this.courseId) {
        // CREATE: POST /api/courses/{courseId}/modules
        this.courseService.addModule(this.courseId, moduleData).subscribe({
          next: () => this.handleSuccess('Module added to course'),
          error: (err) => alert(err.error?.message || 'Creation failed')
        });
      }
    }
  }

  private handleSuccess(msg: string) {
    alert(msg);
    // If we have courseId, go back to course details, otherwise go to dashboard
    if (this.courseId) {
      this.router.navigate(['/courses', this.courseId]);
    } else {
      window.history.back(); // Simple way to return to previous page
    }
  }
}
