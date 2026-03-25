import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Submission } from '../models/submission';
import { ApiResponse } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private http = inject(HttpClient);
  
  // Adjust this base URL to match your environment configuration if needed
  private baseUrl = 'http://localhost:8050/api/analysis'; 

  /**
   * Fetches all submissions for a specific user ID.
   * Corresponds to Spring Boot endpoint: GET /api/analysis/getByUserId/{userId}
   * * @param userId The ID of the student
   * @returns An Observable containing the ApiResponse from the backend
   */
  getAllSubmissionById(userId: number) {
    return this.http.get<ApiResponse<Submission[]>>(`${this.baseUrl}/getByUserId/${userId}`);
  }
}