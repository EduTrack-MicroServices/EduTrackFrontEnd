import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/auth';
import { Attendance, AttendanceSummaryResponse } from '../models/attendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private http = inject(HttpClient);
  
  // Base URL matching the @RequestMapping("/api/attendance") in your controller
  private baseUrl = 'http://localhost:8050/api/attendance';

  /**
   * Fetch the attendance summary for a specific user.
   * Maps to: GET /api/attendance/{userId}
   */
  getAttendanceSummary(userId: number) {
    return this.http.get<ApiResponse<AttendanceSummaryResponse>>(`${this.baseUrl}/${userId}`);
  }

  /**
   * Mark attendance for a specific user for today.
   * Maps to: POST /api/attendance/markAttendance/{userId}
   * * Note: We pass 'null' as the body payload because the backend 
   */
  markAttendance(userId: number) {
    return this.http.post<ApiResponse<Attendance>>(`${this.baseUrl}/markAttendance/${userId}`, null);
  }
}