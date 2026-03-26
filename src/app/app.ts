import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';
import { SidebarComponent } from './core/components/sidebar/sidebar';
import { NgxSonnerToaster } from 'ngx-sonner'; // <-- 1. Import Sonner here

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
   


}