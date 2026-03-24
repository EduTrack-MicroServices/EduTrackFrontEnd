// src/app/models/attendance.ts

export interface AttendanceSummaryResponse {
  userId: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
}

export interface Attendance {
  id?: number;
  userId: number;
  loginDate: string; // ISO date string (YYYY-MM-DD)
  loginTime: string; // ISO time string (HH:mm:ss)
}