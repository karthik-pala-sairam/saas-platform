import { Body, Controller, ForbiddenException, Get, Param, Post } from '@nestjs/common';
import { CurrentUser, Roles } from '@saas-platform/auth';
import type { CreateFolderDto, CreateProjectDto } from '@saas-platform/shared';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const DB_FILE = '/tmp/project-service-db.json';

type Project = { id: string; name: string; ownerId: string; createdAt: string };
type Folder = { id: string; projectId: string; parentId: string | null; name: string; ownerId: string; createdAt: string };

@Controller('projects')
@Roles('saas-user')
export class AppController {
  private readDb(): { projects: Project[]; folders: Folder[] } {
    if (!existsSync(DB_FILE)) {
      mkdirSync('/tmp', { recursive: true });
      writeFileSync(DB_FILE, JSON.stringify({ projects: [], folders: [] }));
    }
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  }

  private writeDb(data: { projects: Project[]; folders: Folder[] }) {
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  @Get()
  getProjects(@CurrentUser() user: any) {
    return this.readDb().projects.filter((p) => p.ownerId === user.sub);
  }

  @Post()
  createProject(@Body() project: CreateProjectDto, @CurrentUser() user: any) {
    if (!project?.name?.trim()) throw new ForbiddenException('Project name is required');
    const db = this.readDb();
    const rec: Project = { id: randomUUID(), name: project.name.trim(), ownerId: user.sub, createdAt: new Date().toISOString() };
    db.projects.push(rec);
    this.writeDb(db);
    return rec;
  }


  @Get(':projectId')
  getProject(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    const p = this.readDb().projects.find((x) => x.id === projectId && x.ownerId === user.sub);
    if (!p) throw new ForbiddenException('Project not found or forbidden');
    return p;
  }

  @Get(':projectId/folders')
  getProjectFolders(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    this.assertProjectOwner(projectId, user.sub);
    const folders = this.readDb().folders.filter((f) => f.projectId === projectId && f.ownerId === user.sub);
    return this.buildTree(folders);
  }

  @Post(':projectId/folders')
  createFolder(@Param('projectId') projectId: string, @Body() folder: CreateFolderDto, @CurrentUser() user: any) {
    if (!folder?.name?.trim()) throw new ForbiddenException('Folder name is required');
    this.assertProjectOwner(projectId, user.sub);
    const db = this.readDb();
    const rec: Folder = {
      id: randomUUID(),
      projectId,
      parentId: folder.parentId ?? null,
      name: folder.name.trim(),
      ownerId: user.sub,
      createdAt: new Date().toISOString(),
    };
    db.folders.push(rec);
    this.writeDb(db);
    return rec;
  }

  private assertProjectOwner(projectId: string, ownerId: string) {
    const p = this.readDb().projects.find((x) => x.id === projectId && x.ownerId === ownerId);
    if (!p) throw new ForbiddenException('Project not found or forbidden');
  }

  private buildTree(flat: Folder[]) {
    const map = new Map<string, any>();
    const roots: any[] = [];
    for (const f of flat) map.set(f.id, { ...f, children: [] });
    for (const f of map.values()) {
      if (f.parentId && map.has(f.parentId)) map.get(f.parentId).children.push(f);
      else roots.push(f);
    }
    return roots;
  }
}
