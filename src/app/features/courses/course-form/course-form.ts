import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Course } from '../../../core/models/course';
import { CourseService } from '../../../core/services/course-service';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner'; // <-- Import Sonner toast

@Component({
  selector: 'app-course-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './course-form.html',
  styleUrl: './course-form.css',
})
export class CourseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  courseId: number | null = null;
  programId: number | null = null;
  isEditMode = false;

  courseForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    creditPoints: [0, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit() {
    // 1. Check if we are editing an existing course
    const cId = this.route.snapshot.paramMap.get('courseId');
    // 2. Check if we are adding a new course to a program
    const pId = this.route.snapshot.paramMap.get('programId');

    if (cId) {
      this.courseId = +cId;
      this.isEditMode = true;
      this.loadCourseData(this.courseId);
    } else if (pId) {
      this.programId = +pId;
    }
  }

  loadCourseData(id: number) {
    this.courseService.getCourseById(id).subscribe({
      next: (res) => {
        if (res.success) this.courseForm.patchValue(res.data);
      },
      error: () => {
        toast.error('Failed to load course details');
      }
    });
  }

  onSubmit() {
    if (this.courseForm.valid) {
      const courseData = this.courseForm.value as Course;

      if (this.isEditMode && this.courseId) {
        // UPDATE: PUT /api/courses/{courseId}
        this.courseService.updateCourse(this.courseId, courseData).subscribe({
          next: () => this.handleSuccess('Course Updated Successfully!'),
          error: (err) => {
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Update failed');
            toast.error('Failed to update course', { description: errorMessage });
          }
        });
      } else if (this.programId) {
        // CREATE: POST /api/programs/{programId}/courses
        this.courseService.addCourse(this.programId, courseData).subscribe({
          next: () => this.handleSuccess('Course Added to Program!'),
          error: (err) => {
            const backendErrors = err.error?.errors || err.error?.message;
            const errorMessage = Array.isArray(backendErrors) ? backendErrors.join(', ') : (backendErrors || 'Creation failed');
            toast.error('Failed to create course', { description: errorMessage });
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
    this.router.navigate(['/programs', this.programId]);
  }
  handleSuccess(msg: string) {
    toast.success(msg, { duration: 3000 }); // Show success toast instead of alert()
    
    // Redirect back to program details
    if (this.programId) {
        this.router.navigate(['/programs', this.programId]);
    } else {
        window.history.back();
    }
  }
}