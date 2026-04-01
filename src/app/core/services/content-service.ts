import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/auth';
import { Content } from '../models/content';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8050/api/content'; // Gateway port

  getContentByModule(moduleId: number) {
    return this.http.get<ApiResponse<Content[]>>(`${this.baseUrl}/module/${moduleId}`);
  }

  getContentById(contentId: Number) {
    console.log("fetching content")
    return this.http.get<ApiResponse<Content>>(`${this.baseUrl}/${contentId}`);
  }

  saveContentByModule(moduleId: number, content: Content) {
    return this.http.post<ApiResponse<Content>>(`${this.baseUrl}/module/${moduleId}`, content);
  }

  updateContent(id: number, content: Content) {
    return this.http.put<ApiResponse<Content>>(`${this.baseUrl}/${id}`, content);
  }

  deleteContent(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
