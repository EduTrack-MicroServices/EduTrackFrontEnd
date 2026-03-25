export interface Submission {
  submissionId?: number;     // Optional because the backend auto-generates this
  assessmentId: number;
  userId: number;
  submittedDate?: string;    // Typically handled as an ISO Date string in JSON (e.g., "2026-03-24T14:30:00")
  score: number;
  feedback?: string;         // Optional because it might be empty before grading
}