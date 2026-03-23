import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../../core/services/content-service';

@Component({
  selector: 'app-content-form',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './content-form.html',
  styleUrl: './content-form.css',
})
export class ContentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  moduleId!: number;

  // Validation matches your Spring Boot @Pattern and @Size annotations
  contentForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    contentType: ['Video', [Validators.required, Validators.pattern('Video|PDF|Slide|Lab')]],
    contentUri: ['', Validators.required],
    duration: [1, [Validators.required, Validators.min(1)]],
    status: ['Published', [Validators.required, Validators.pattern('Draft|Published')]]
  });

  ngOnInit() {
    // Get the moduleId from the route: /modules/:moduleId/add-content
    this.moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
  }

  onSubmit() {
    if (this.contentForm.valid) {
      // Create the object to match your backend Content model
      const newContent = {
        ...this.contentForm.value,
        moduleId: this.moduleId
      };

      this.contentService.saveContentByModule(this.moduleId, newContent as any).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Content added successfully to the module!');
            window.history.back(); // Go back to the module viewer
          }
        },
        error: (err) => alert(err.error?.message || 'Failed to save content')
      });
    }
  }
}