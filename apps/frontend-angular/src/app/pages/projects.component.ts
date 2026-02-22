import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../services/projects.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <section class="panel">
      <h2>Projects</h2>

      <form class="toolbar" (ngSubmit)="addProject()">
        <input [(ngModel)]="projectName" name="projectName" placeholder="Project name" />
        <button type="submit" [disabled]="isSubmitting || !projectName.trim()">Add Project</button>
      </form>

      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      <p *ngIf="isLoading" class="muted">Loading projects...</p>

      <ul class="items" *ngIf="!isLoading && projects.length; else emptyState">
        <li *ngFor="let project of projects">{{ project.name }}</li>
      </ul>

      <ng-template #emptyState>
        <p *ngIf="!isLoading" class="muted">No projects yet. Create one to get started.</p>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .panel {
        background: #fff;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
      }
      h2 { margin: 0 0 14px; }
      .toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
      input {
        flex: 1;
        min-width: 220px;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
      }
      button {
        border: none;
        background: #2563eb;
        color: #fff;
        border-radius: 8px;
        padding: 10px 14px;
        font-weight: 600;
      }
      .items { padding-left: 18px; margin: 10px 0 0; }
      .items li { margin: 6px 0; }
      .error { color: #b91c1c; }
      .muted { color: #64748b; }
    `,
  ],
})
export class ProjectsComponent implements OnInit {
  projectName = '';
  projects: any[] = [];
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';

  constructor(private projectsService: ProjectsService) {}

  ngOnInit() {
    this.projectsService.getProjects().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Unable to load projects.';
        this.isLoading = false;
        console.error('Error loading projects:', err);
      },
    });
  }

  addProject() {
    const name = this.projectName.trim();
    if (!name || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.projectsService.createProject({ name }).subscribe({
      next: (res: any) => {
        this.projects.push(res);
        this.projectName = '';
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Unable to create project. Please try again.';
        this.isSubmitting = false;
        console.error('Error creating project:', err);
      },
    });
  }
}
