import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilesService } from '../services/files.service';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <section class="panel">
      <h2>Files</h2>

      <div class="grid">
        <input [(ngModel)]="projectId" placeholder="Project ID" />
        <input [(ngModel)]="folderId" placeholder="Folder ID (optional)" />
      </div>

      <div class="toolbar">
        <input type="file" (change)="onFileSelected($event)" />
        <button (click)="uploadFile()" [disabled]="!selectedFile || !projectId">Upload</button>
        <button (click)="loadFiles()" [disabled]="!projectId">List Files</button>
      </div>

      <p *ngIf="uploaded" class="success">Uploaded: {{ fileName }}</p>
      <p *ngIf="isLoading" class="muted">Loading...</p>
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>

      <ul class="items" *ngIf="files.length">
        <li *ngFor="let file of files">
          <span>{{ file.name }} (id: {{ file.id }})</span>
          <div>
            <button (click)="loadMetadata(file.id)">Metadata</button>
            <button (click)="download(file.id)">Download</button>
          </div>
        </li>
      </ul>

      <pre *ngIf="metadata">{{ metadata | json }}</pre>
    </section>
  `,
  styles: [
    `
      .panel { background:#fff; border-radius:14px; padding:20px; box-shadow:0 8px 24px rgba(15,23,42,.07); }
      .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom: 10px; }
      .toolbar { display:flex; gap:10px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
      input { padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; }
      button { border:none; background:#2563eb; color:#fff; border-radius:8px; padding:8px 12px; font-weight:600; }
      .items { list-style:none; padding:0; margin: 14px 0; display:grid; gap:8px; }
      .items li { display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; }
      .items li div { display:flex; gap:8px; }
      .success { color:#166534; font-weight:600; }
      .muted { color:#64748b; font-weight:500; }
      .error { color:#b91c1c; font-weight:500; }
      pre { background:#0f172a; color:#e2e8f0; padding:12px; border-radius:10px; overflow:auto; }
    `,
  ],
})
export class FilesComponent {
  fileName = '';
  uploaded = false;
  selectedFile: File | null = null;
  projectId = '';
  folderId = '';
  files: any[] = [];
  metadata: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(private filesService: FilesService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    }
  }

  uploadFile() {
    if (this.selectedFile && this.projectId.trim()) {
      this.isLoading = true;
      this.errorMessage = '';

      this.filesService
        .uploadFile(this.selectedFile, this.projectId.trim(), this.folderId.trim() || undefined)
        .subscribe({
          next: () => {
            this.uploaded = true;
            this.isLoading = false;
            this.loadFiles();
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'Unable to upload file.';
            console.error('Error uploading file:', err);
          },
      });
    }
  }

  loadFiles() {
    if (!this.projectId.trim()) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.filesService.getFiles(this.projectId.trim()).subscribe({
      next: (res: any) => {
        this.files = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Unable to load files.';
        console.error('Error loading files:', err);
      },
    });
  }

  loadMetadata(fileId: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.filesService.getFileMetadata(fileId).subscribe({
      next: (res: any) => {
        this.metadata = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Unable to load metadata.';
        console.error('Error loading metadata:', err);
      },
    });
  }

  download(fileId: string) {
    this.filesService.download(fileId).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }
}
