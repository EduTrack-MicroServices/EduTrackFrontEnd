import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ApiResponse, LoginResponse, UserResponse } from '../models/auth';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';




interface DecodedToken {
  sub: string;
  role: string;
  userId: number; // This matches your .claim("userId", ...)
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8050/api'; 
  private router = inject(Router);

  private currentUser = signal<any>(null);
  // Signals for state management
  //userRole = signal<string | null>(localStorage.getItem('role'));
  // Initialize with null if nothing is in storage
userRole = signal<string | null>(localStorage.getItem('role') || null);


  

  login(loginData: any) {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        tap(res => {
          if (res.success) {
            console.log('Login successful, token received:', res.data.token);

            const decoded = jwtDecode<DecodedToken>(res.data.token);
            const userIdFromToken = decoded.userId;
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('userId', userIdFromToken.toString());
            localStorage.setItem('tokenExpiration', decoded.exp.toString());

            this.userRole.set(res.data.role);
          }
        })
      );
  }

  registerStudent(user: any) {
    return this.http.post<ApiResponse<UserResponse>>(`${this.apiUrl}/users/registerUser`, user);
  }

  registerProfessor(user: any) {
    return this.http.post<ApiResponse<UserResponse>>(`${this.apiUrl}/users/registerProfessor`, user);
  }


  // Admin Actions
  getAllUsers() {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/users/getUsers`);
  }


  // ADMIN: Delete a user by ID
  deleteUser(userId: number) {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/users/deleteUser/${userId}`);
  }

  // ADMIN: Approve an instructor
  approveInstructor(email: string) {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/users/approve/${email}`, {});
  }

  // ADMIN: Reject an instructor
  rejectInstructor(email: string) {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/users/reject/${email}`, {});
  }



  logout() {
    localStorage.clear();
    this.userRole.set(null);
    this.router.navigate(['/home'])
    
  }
  getUserId(): number {
    const id = localStorage.getItem('userId');
    return id ? Number(id) : 0;
  }

fetchUserDetails() {
    const id = this.getUserId();

    console.log('Fetching details for user ID:', id); // Debugging line
    if (id === 0) return;

    this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/getUser/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentUser.set(res.data);
          // Optional: Save name to localStorage for persistence across refreshes
          localStorage.setItem('userName', res.data.userName); 
          console.log('User details fetched successfully:', res.data.userName); // Debugging line
        }
      }
    });
  }

  getUserName(): string {
    return this.currentUser()?.userName || localStorage.getItem('userName') || 'Learner';
  }


}