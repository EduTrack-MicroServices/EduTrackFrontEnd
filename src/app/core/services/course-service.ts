import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/auth';
import { Course, Module, Program } from '../models/course';
import { ProgramProgressResponse, ProgressStatusResponse } from '../models/progress';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8050/api'; // Adjust to your Course Microservice Port

  // ================= PROGRAM API =================
  getAllPrograms() {
    return this.http.get<ApiResponse<Program[]>>(`${this.baseUrl}/programs`);
  }

  getProgramById(id: number) {
    return this.http.get<ApiResponse<Program>>(`${this.baseUrl}/programs/${id}`);
  }

  createProgram(program: Program) {
    return this.http.post<ApiResponse<Program>>(`${this.baseUrl}/programs`, program);
  }


  updateProgram(id: number, program: Program) {
    return this.http.put<ApiResponse<Program>>(`${this.baseUrl}/programs/${id}`, program);
  }

  deleteProgram(id: number) {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/programs/${id}`);
  }




  // Courses

  addCourse(programId: number, course: Course) {
    return this.http.post<ApiResponse<Course>>(`${this.baseUrl}/programs/${programId}/courses`, course);
  }

  updateCourse(courseId: number, course: Course) {
    return this.http.put<ApiResponse<Course>>(`${this.baseUrl}/courses/${courseId}`, course);
  }
  deleteCourse(courseId: number) {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/courses/${courseId}`);
  }

  // ================= COURSE API =================
  getCoursesByProgram(programId: number) {
    return this.http.get<ApiResponse<Course[]>>(`${this.baseUrl}/programs/${programId}/courses`);
  }

  getCourseById(courseId: number) {
    return this.http.get<ApiResponse<Course>>(`${this.baseUrl}/courses/${courseId}`);
  }

  // ================= MODULE API =================
  getModulesByCourse(courseId: number) {
    return this.http.get<ApiResponse<Module[]>>(`${this.baseUrl}/courses/${courseId}/modules`);
  }

  deleteModule(moduleId: number) {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/modules/${moduleId}`);
  }
  getModuleById(moduleId: number) {
    return this.http.get<ApiResponse<Module>>(`${this.baseUrl}/modules/${moduleId}`);
  }
  addModule(courseId: number, module: Module) {
    return this.http.post<ApiResponse<Module>>(`${this.baseUrl}/courses/${courseId}/modules`, module);
  }

  updateModule(moduleId: number, module: Module) {
    return this.http.put<ApiResponse<Module>>(`${this.baseUrl}/modules/${moduleId}`, module);
  }


  // ================= PROGRESS API =================

  moduleStatus(userId: number, courseId: number, moduleId: number) {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/progress/module-status/course/${courseId}/module/${moduleId}/user/${userId}`
    )

  }



  markModuleComplete(userId: number, courseId: number, moduleId: number) {
    const params = new HttpParams()
      .set('userId', userId)
      .set('courseId', courseId)
      .set('moduleId', moduleId);

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/progress/module-complete`, null, { params });
  }

  /**
   * LEVEL 2: Get status for a specific course.
   * Used to enable/disable the "Start Assessment" button.
   */
  getCourseProgressStatus(courseId: number, userId: number) {
    return this.http.get<ApiResponse<ProgressStatusResponse>>(
      `${this.baseUrl}/progress/course-status/${courseId}/user/${userId}`
    );
  }

  /**
   * LEVEL 2: Record a passed assessment.
   * Triggered after the student passes the quiz. Returns updated Program progress.
   */
  recordAssessmentPass(userId: number, courseId: number, score: number) {
    const params = new HttpParams()
      .set('userId', userId)
      .set('courseId', courseId)
      .set('score', score);

    return this.http.post<ApiResponse<ProgramProgressResponse>>(
      `${this.baseUrl}/progress/assessment-pass`, null, { params }
    );
  }

  /**
   * LEVEL 3: Get overall Program progress.
   * Used on the Dashboard to show the "Program Completion %" progress bar.
   */
  getProgramProgress(programId: number, userId: number) {
    return this.http.get<ApiResponse<ProgramProgressResponse>>(
      `${this.baseUrl}/progress/program-status/${programId}/user/${userId}`
    );
  }
}