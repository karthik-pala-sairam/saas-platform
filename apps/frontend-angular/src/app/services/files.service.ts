import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private baseUrl = 'http://localhost:3003/api/files';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, projectId: string, folderId?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    if (folderId) formData.append('folderId', folderId);

    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  getFiles(projectId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/project/${projectId}`);
  }

  getFileMetadata(fileId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${fileId}/metadata`);
  }

  download(fileId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${fileId}/download`, { responseType: 'blob' });
  }
}
