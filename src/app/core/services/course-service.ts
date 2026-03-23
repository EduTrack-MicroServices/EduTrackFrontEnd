import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/auth';
import { Course, Module, Program } from '../models/course';

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
  return this.http.post<ApiResponse<Module>>(`${this.baseUrl}/courses/${courseId}/modules`, module);}

updateModule(moduleId: number, module: Module) {
  return this.http.put<ApiResponse<Module>>(`${this.baseUrl}/modules/${moduleId}`, module);}

}