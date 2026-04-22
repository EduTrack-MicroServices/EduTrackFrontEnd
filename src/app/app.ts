import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';
import { SidebarComponent } from './core/components/sidebar/sidebar';
import { NgxSonnerToaster } from 'ngx-sonner'; // <-- 1. Import Sonner here
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  // 2. Add NgxSonnerToaster to your imports array
  imports: [RouterOutlet, SidebarComponent, NgxSonnerToaster], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // protected readonly title = signal('EduTrackFrontEnd');
  public authService = inject(AuthService);
   private router = inject(Router);
  
  // Create a new signal to control the sidebar
  showSidebar = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Logic: Show sidebar only if user has a role AND is NOT on the login page ('/')
      const isLoginPage = this.router.url === '/' || this.router.url === '/home';
      this.showSidebar.set(!!this.authService.userRole() && !isLoginPage);
    });
  }
}


