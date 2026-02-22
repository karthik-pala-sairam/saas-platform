import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private baseUrl = 'http://localhost:3002/api/projects';
  private projectsCache$?: Observable<any[]>;

  constructor(private http: HttpClient) {}

  getProjects(forceRefresh = false): Observable<any[]> {
    if (!this.projectsCache$ || forceRefresh) {
      this.projectsCache$ = this.http.get<any[]>(this.baseUrl).pipe(shareReplay(1));
    }
    return this.projectsCache$;
  }

  createProject(project: any): Observable<any> {
    return this.http.post(this.baseUrl, project).pipe(
      tap(() => {
        this.projectsCache$ = undefined;
      }),
    );
  }

  getFolders(projectId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${projectId}/folders`);
  }

  createFolder(projectId: string, folder: { name: string; parentId?: string | null }): Observable<any> {
    return this.http.post(`${this.baseUrl}/${projectId}/folders`, folder);
  }
}
