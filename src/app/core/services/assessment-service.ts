import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private baseUrl = 'http://localhost:8050/api';

  constructor(private http: HttpClient) {}

  // ============================================================
  // ASSESSMENT APIs
  // ============================================================

  getAssessmentById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/assessment/${id}`);
  }
  getAssessmentByCourseId(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/assessment/courseId/${id}`);
  }

  getAllAssessments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/assessments`);
  }

  createAssessment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/assessment`, data);
  }

  updateAssessment(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/assessment/${id}`, data);
  }

  deleteAssessment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/assessment/${id}`);
  }
 

  // ============================================================
  // QUESTION APIs
  // ============================================================

  getQuestionById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/questions/${id}`);
  }

  getAllQuestions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/questions`);
  }

  createQuestion(question: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/questions`, question);
  }

  updateQuestion(id: number, updated: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/questions/${id}`, updated);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/questions/${id}`);
  }

  bulkCreateQuestions(questions: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/questions/bulk`, questions);
  }

  getQuestionsByCourseId(courseId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/questions/course/${courseId}`);
  }

  // ============================================================
  // QUIZ APIs
  // ============================================================

  getQuizQuestions(
    courseId: number,
    size: number = 10,
    includeAnswers: boolean = true,
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/quiz/course/${courseId}?size=${size}&includeAnswers=${includeAnswers}`,
    );
  }

  // ============================================================
  // SUBMISSION APIs
  // ============================================================

  getSubmissionById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/submission/${id}`);
  }

  getAllSubmissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/submissions`);
  }

  createSubmission(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/submission`, data);
  }

  updateSubmission(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/submission/${id}`, data);
  }

  deleteSubmission(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/submission/${id}`);
  }
   checkSubmission(userId: number, assessmentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/submission/checkSubmission/${userId}/assessment/${assessmentId}`);
  }

  // ------------------ ANALYTICS ------------------

  getCourseAverage(courseId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analysis/course/${courseId}`);
  }

  getProgramAverage(programId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analysis/program/${programId}`);
  }

  getStudentAverage(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analysis/student/${userId}`);
  }

  getStudentAverageByProgram(userId: number, programId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/analysis/student/${userId}/program/${programId}`);
  }
}
