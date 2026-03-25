export interface Submission {
  submissionId?: number;
  assessmentId: number;
  userId: number;
  submittedDate: Date | string;
  score: number;
  feedback?: string;
}