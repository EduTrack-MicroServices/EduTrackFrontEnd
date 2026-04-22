import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../../../core/services/content-service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-content-form',
  standalone: true, // Recommended for modern Angular
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './content-form.html',
  styleUrl: './content-form.css',
})
export class ContentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  moduleId!: number;
  contentId: number | null = null;
  isEditMode = signal<boolean>(false);

  contentForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    contentType: ['Video', [Validators.required, Validators.pattern('Video|PDF|Slide|Lab')]],
    contentUri: ['', Validators.required],
    duration: [1, [Validators.required, Validators.min(1)]],
    status: ['Published', [Validators.required, Validators.pattern('Draft|Published')]]
  });

  ngOnInit() {
    this.moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    const id = this.route.snapshot.paramMap.get('contentId');

    if (id) {
      console.log(id)
      this.contentId = Number(id);
      this.isEditMode.set(true);
      this.loadContentForEdit(this.contentId);
    }
  }

  loadContentForEdit(id: number) {
    this.contentService.getContentById(id).subscribe({
      next: (res) => {
        if (res.success) {
          console.log(res.data)
          this.contentForm.patchValue(res.data);
        }
        else{
          console.log(res)
        }
      },
      error: () => toast.error('Failed to load content details')
    });
  }

  onSubmit() {
    if (this.contentForm.valid) {
      const payload = {
        ...this.contentForm.value,
        moduleId: this.moduleId
      };

      if (this.isEditMode()) {
        // UPDATE Existing Content
        this.contentService.updateContent(this.contentId!, payload as any).subscribe({
          next: (res) => {
            if (res.success) {
              toast.success('Content updated successfully');
              window.history.back();
            }
            else{
              console.log("update failed" +res)
            }
          },
          error: (err) => toast.error(err.error?.message || 'Update failed')
        });
      } else {
        // SAVE New Content
        this.contentService.saveContentByModule(this.moduleId, payload as any).subscribe({
          next: (res) => {
            if (res.success) {
              toast.success('Content added successfully');
              window.history.back();
            }
          },
          error: (err) => toast.error(err.error?.message || 'Save failed')
        });
      }
    }
  }
}