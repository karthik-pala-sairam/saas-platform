import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FolderTreeComponent } from '../folder-tree/folder-tree.component';
import { ProjectsService } from '../services/projects.service';

@Component({
  selector: 'app-folders',
  standalone: true,
  imports: [CommonModule, FormsModule, FolderTreeComponent],
  template: `
    <section class="panel">
      <h2>Folders</h2>

      <p *ngIf="projectsLoading" class="muted">Loading projects...</p>

      <div class="grid">
        <select [(ngModel)]="selectedProjectId" (change)="loadFolders()" [disabled]="projectsLoading">
          <option [ngValue]="null">Select project</option>
          <option *ngFor="let project of projects" [ngValue]="project.id">{{ project.name }}</option>
        </select>
      </div>

      <div *ngIf="selectedProjectId" class="toolbar">
        <input [(ngModel)]="folderName" placeholder="Folder name" />
        <input [(ngModel)]="parentFolderId" placeholder="Parent folder id (optional)" />
        <button (click)="createFolder()">Create Folder</button>
      </div>

      <p *ngIf="foldersLoading" class="muted">Loading folders...</p>
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>

      <app-folder-tree [folders]="folders"></app-folder-tree>
    </section>
  `,
  styles: [
    `
      .panel { background:#fff; border-radius:14px; padding:20px; box-shadow:0 8px 24px rgba(15,23,42,.07); }
      h2 { margin:0 0 14px; }
      .grid { margin-bottom: 10px; }
      .toolbar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom: 12px; }
      select, input { padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; min-width:220px; }
      button { border:none; background:#2563eb; color:#fff; border-radius:8px; padding:10px 14px; font-weight:600; }
      .muted { color:#64748b; margin: 8px 0; }
      .error { color:#b91c1c; margin: 8px 0; }
    `,
  ],
})
export class FoldersComponent implements OnInit {
  projects: any[] = [];
  folders: any[] = [];
  selectedProjectId: string | null = null;
  folderName = '';
  parentFolderId = '';
  projectsLoading = true;
  foldersLoading = false;
  errorMessage = '';

  constructor(private projectsService: ProjectsService) {}

  ngOnInit() {
    this.projectsService.getProjects().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.projectsLoading = false;
      },
      error: (err: any) => {
        this.projectsLoading = false;
        this.errorMessage = 'Unable to load projects.';
        console.error('Error loading projects for folders:', err);
      },
    });
  }

  loadFolders() {
    if (!this.selectedProjectId) {
      this.folders = [];
      return;
    }

    this.foldersLoading = true;
    this.errorMessage = '';

    this.projectsService.getFolders(this.selectedProjectId).subscribe({
      next: (res: any) => {
        this.folders = res;
        this.foldersLoading = false;
      },
      error: (err: any) => {
        this.foldersLoading = false;
        this.errorMessage = 'Unable to load folders.';
        console.error('Error loading folders:', err);
      },
    });
  }

  createFolder() {
    if (!this.selectedProjectId || !this.folderName.trim()) return;

    const parentId = this.parentFolderId.trim() || null;
    this.projectsService
      .createFolder(this.selectedProjectId, { name: this.folderName.trim(), parentId })
      .subscribe({
        next: () => {
          this.folderName = '';
          this.parentFolderId = '';
          this.loadFolders();
        },
        error: (err: any) => console.error('Error creating folder:', err),
      });
  }
}
