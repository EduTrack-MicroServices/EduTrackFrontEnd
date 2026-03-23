import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Program } from '../../../core/models/course';
import { CommonModule } from '@angular/common';

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
      }
    });
  }

  onSubmit() {
    if (this.programForm.valid) {
      const programData = this.programForm.value as Program;

      if (this.isEditMode && this.programId) {
        // UPDATE Logic
        this.courseService.updateProgram(this.programId, programData).subscribe({
          next: () => this.handleSuccess('Program Updated Successfully'),
          error: (err) => alert(err.error?.message || 'Update failed')
        });
      } else {
        // CREATE Logic
        this.courseService.createProgram(programData).subscribe({
          next: () => this.handleSuccess('Program Created Successfully'),
          error: (err) => alert(err.error?.message || 'Creation failed')
        });
      }
    }
  }

  private handleSuccess(msg: string) {
    alert(msg);
    this.router.navigate(['/program-list']); 
  }
}
