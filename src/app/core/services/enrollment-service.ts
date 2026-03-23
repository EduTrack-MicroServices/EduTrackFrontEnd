import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EnrollmentRequest, EnrollmentResponse, EnrollmentStatusUpdateRequest } from '../models/enrollment';
import { ApiResponse } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8050/api/enrollments';

  // Create new enrollment
  createEnrollment(request: EnrollmentRequest) {
    return this.http.post<ApiResponse<EnrollmentResponse>>(this.baseUrl, request);
  }

  // Check if student is already in a program
  checkEnrollmentExists(userId: number, programId: number, status: string = 'Active') {
    const params = new HttpParams()
      .set('userId', userId)
      .set('programId', programId)
      .set('status', status);
    return this.http.get<boolean>(`${this.baseUrl}/exists`, { params });
  }

  // Get all enrollments for a specific student
  getEnrollmentsByStudent(userId: number) {
    return this.http.get<ApiResponse<EnrollmentResponse[]>>(`${this.baseUrl}/by-student/${userId}`);
  }

  // Admin/Instructor: Update status (Active, Completed, Dropped)
  updateStatus(enrollmentId: number, request: EnrollmentStatusUpdateRequest) {
    return this.http.put<ApiResponse<EnrollmentResponse>>(`${this.baseUrl}/${enrollmentId}/status`, request);
  }

  // Admin/Instructor: Delete enrollment record
  deleteEnrollment(enrollmentId: number) {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${enrollmentId}`);
  }

  // Admin/Instructor: Get all students in a specific program
  getEnrollmentsByProgram(programId: number) {
    return this.http.get<ApiResponse<EnrollmentResponse[]>>(`${this.baseUrl}/by-Program/${programId}`);
  }
}