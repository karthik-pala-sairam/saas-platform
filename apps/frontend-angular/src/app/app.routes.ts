import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { ProjectsComponent } from './pages/projects.component';
import { FilesComponent } from './pages/files.component';
import { AuthGuard } from './auth.guard';
import { FoldersComponent } from './pages/folders.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'files', component: FilesComponent, canActivate: [AuthGuard] },
  { path: 'folders', component: FoldersComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/projects', pathMatch: 'full' }
];