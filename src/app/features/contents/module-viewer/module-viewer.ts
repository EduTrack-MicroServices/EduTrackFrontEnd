import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Content } from '../../../core/models/content';
import { AuthService } from '../../../core/services/auth';
import { ContentService } from '../../../core/services/content-service';
import { CommonModule } from '@angular/common';

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

  moduleId!: number;
  programId!: number;
  courseId!: number;
  contents = signal<Content[]>([]);
  activeContent = signal<Content | null>(null);
  isEditor = computed(() => this.authService.userRole() === 'ADMIN' || this.authService.userRole() === 'INSTRUCTOR');

  ngOnInit() {
    this.moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    console.log('Module ID from route:', this.moduleId);
    this.programId = Number(this.route.snapshot.paramMap.get('programId'));
    console.log('Program ID from route:', this.programId);
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    console.log('Course ID from route:', this.courseId);
    this.loadContents();
  }

  loadContents() {
    this.contentService.getContentByModule(this.moduleId).subscribe(res => {
      if (res.success) {
        this.contents.set(res.data);
        if (res.data.length > 0) this.selectContent(res.data[0]);
      }
    });
  }

  selectContent(content: Content) {
    this.activeContent.set(content);
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

  back() {    
    window.history.back();
  }
  onDelete(id: number) {
    if (confirm('Delete this content?')) {
      this.contentService.deleteContent(id).subscribe(() => {
        this.loadContents();
      });
    }
  }
}
