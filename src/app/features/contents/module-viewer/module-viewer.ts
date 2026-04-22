import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Content } from '../../../core/models/content';
import { AuthService } from '../../../core/services/auth';
import { ContentService } from '../../../core/services/content-service';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../core/services/course-service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-module-viewer',
  imports: [CommonModule,RouterLink],
  templateUrl: './module-viewer.html',
  styleUrl: './module-viewer.css',
})
export class ModuleViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private courseService = inject(CourseService); // New
  loading = signal<boolean>(true);
  moduleId!: number;
  programId!: number;
  courseId!: number;
  contents = signal<Content[]>([]);
  activeContent = signal<Content | null>(null);
  isEditor = computed(() => this.authService.userRole() === 'ADMIN' || this.authService.userRole() === 'INSTRUCTOR');

  isModuleCompleted = signal<boolean>(false);

  ngOnInit() {
    this.moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    console.log('Module ID from route:', this.moduleId);
    this.programId = Number(this.route.snapshot.paramMap.get('programId'));
    console.log('Program ID from route:', this.programId);
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    console.log('Course ID from route:', this.courseId);
   

    // Only check status for students
    if (!this.isEditor()) {
      this.checkModuleStatus();
    }

     this.loadContents();
  }

checkModuleStatus() {
  const userId = this.authService.getUserId();
  this.courseService.moduleStatus(userId, this.courseId, this.moduleId).subscribe({
    next: (res) => {
      // Set to true only if the backend explicitly confirms completion
      this.isModuleCompleted.set(res.success === true);
    },
    error: (err) => {
      // If error (like 404 not found), it just means not completed yet
      this.isModuleCompleted.set(false);
    }
  });
}

// Inside loadContents() method in module-viewer.component.ts

// module-viewer.component.ts

loadContents() {
  this.loading.set(true);
  this.contentService.getContentByModule(this.moduleId).subscribe({
    next: (res) => {
      // If the backend returns data, the student has access. 
      // Do not perform an additional "is status active" check here.
      if (res.success && res.data) {
        let rawData: Content[] = res.data;
        if (!this.isEditor()) {
          rawData = rawData.filter(item => item.status === 'Published');
        }
        this.contents.set(rawData);
        if (rawData.length > 0) this.activeContent.set(rawData[0]);
      }
      this.loading.set(false);
    },
    error: () => this.loading.set(false)
  });
}
  selectContent(content: Content) {
    this.activeContent.set(content);
  }

  markAsComplete() {
    const userId = this.authService.getUserId();
    this.courseService.markModuleComplete(userId, this.courseId, this.moduleId).subscribe({
      next: (res) => {
        if (res.success) {
          this.isModuleCompleted.set(true);
          toast.success('Module Completed!', {
                        description: 'Successfully marked module as completed.',
                        duration: 2200
                      });
        }
      },
      error: (err) => console.error('Error saving progress', err)
    });
  }

  // Sanitize the URL for the Iframe
 getSafeUrl(url: string): SafeResourceUrl {
  if (!url) return '';

  let embedUrl = url;

  // Handle standard desktop links: youtube.com/watch?v=VIDEO_ID
  if (embedUrl.includes('youtube.com/watch?v=')) {
    embedUrl = embedUrl.replace('watch?v=', 'embed/');
  } 
  
  // Handle shortened mobile/share links: youtu.be/VIDEO_ID
  else if (embedUrl.includes('youtu.be/')) {
    // Extract the ID by splitting at 'youtu.be/' and then splitting at '?' to remove extra params
    const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
}


  async confirmAction(message: string, description: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast.warning(message, {
      description: description,
      action: {
        label: 'Confirm',
        onClick: () => resolve(true),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => resolve(false),
      },
      onDismiss: () => resolve(false), // If the toast expires or is swiped away
    });
  });
}

  async onDelete(id: number) {

        const confirmed = await this.confirmAction(
    'Delete Module?', 
    `Module with id: ${id} will be permanently removed.`
  );

    if (confirmed) {
      this.contentService.deleteContent(id).subscribe(() => {
        this.loadContents();
      });
    }
  }
}
