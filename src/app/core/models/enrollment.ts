export interface EnrollmentRequest {
  programId: number;
  userId: number;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  programId: number;
  userId: number;
  enrolledDate: string;
  status: 'Active' | 'Completed' | 'Dropped';
}

export interface EnrollmentStatusUpdateRequest {
  status: string;
}