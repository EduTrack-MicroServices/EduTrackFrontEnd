import { Component, inject, signal, OnInit } from '@angular/core'; 
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-sidebar',
  exportAs: 'SidebarComponent',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit { 
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isCollapsed = signal(false);
  userRole = this.authService.userRole;
  
  // Store the logged in user's ID
  loggedInUserId = signal<number>(0);

  // Track active dashboard views from the URL
  activeAdminViews = signal<string[]>(['USERS']);

  constructor() {
    // Listen to URL changes to keep the sidebar nodes illuminated correctly
    this.route.queryParams.subscribe(params => {
      if (params['views']) {
        this.activeAdminViews.set(params['views'].split(','));
      } else {
        this.activeAdminViews.set(['USERS']);
      }
    });
  }

  // Get the ID when the sidebar loads
  ngOnInit() {
    this.loggedInUserId.set(this.authService.getUserId());
  }

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  // Multi-select toggle logic for the connected nodes
  toggleAdminModule(view: string) {
    let currentViews = [...this.activeAdminViews()];

    if (currentViews.includes(view)) {
      // FALLBACK RULE: Prevent deselecting the very last table
      if (currentViews.length === 1) {
        toast.info('Core Module Required', { description: 'At least one table must remain visible. Defaulting to User Matrix.' });
        currentViews = ['USERS'];
      } else {
        currentViews = currentViews.filter(v => v !== view);
      }
    } else {
      // Add the newly selected view to the TOP of the array so it shows first
      currentViews.unshift(view);
      
      // Smoothly scroll the user to the top of the page to see the new table
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }

    // Update the URL to trigger the dashboard update
    this.router.navigate(['/admin-dashboard'], { queryParams: { views: currentViews.join(',') } });
  }

  hasView(view: string): boolean {
    return this.activeAdminViews().includes(view);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}