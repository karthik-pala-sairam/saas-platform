import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser, Roles } from '@saas-platform/auth';
import type { UploadFileDto } from '@saas-platform/shared';
import { Response } from 'express';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

const DB_FILE = '/tmp/file-service-db.json';
const STORAGE_DIR = '/tmp/file-storage';

type FileMeta = {
  id: string;
  projectId: string;
  folderId: string | null;
  ownerId: string;
  name: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
};

@Controller('files')
@Roles('saas-user')
export class AppController {
  private readDb(): { files: FileMeta[] } {
    if (!existsSync(DB_FILE)) {
      mkdirSync('/tmp', { recursive: true });
      writeFileSync(DB_FILE, JSON.stringify({ files: [] }));
    }
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  }

  private writeDb(data: { files: FileMeta[] }) {
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileDto,
    @CurrentUser() user: any,
    @Req() req: any
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!body.projectId) throw new BadRequestException('projectId is required');

    await this.assertProjectAccessible(body.projectId, req.headers.authorization);

    mkdirSync(STORAGE_DIR, { recursive: true });
    const id = randomUUID();
    const path = join(STORAGE_DIR, `${id}-${file.originalname}`);
    copyFileSync(file.path, path);

    const db = this.readDb();
    const meta: FileMeta = {
      id,
      projectId: body.projectId,
      folderId: body.folderId || null,
      ownerId: user.sub,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path,
      createdAt: new Date().toISOString(),
    };
    db.files.push(meta);
    this.writeDb(db);
    return meta;
  }

  @Get('project/:projectId')
  async listFiles(@Param('projectId') projectId: string, @CurrentUser() user: any, @Req() req: any) {
    await this.assertProjectAccessible(projectId, req.headers.authorization);
    return this.readDb().files.filter((f) => f.projectId === projectId && f.ownerId === user.sub);
  }

  @Get(':id/metadata')
  getFileMetadata(@Param('id') id: string, @CurrentUser() user: any) {
    const file = this.readDb().files.find((f) => f.id === id && f.ownerId === user.sub);
    if (!file) throw new ForbiddenException('File not found or forbidden');
    return file;
  }

  @Get(':id/download')
  download(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
    const file = this.readDb().files.find((f) => f.id === id && f.ownerId === user.sub);
    if (!file) throw new ForbiddenException('File not found or forbidden');
    return res.download(file.path, file.name);
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  private async assertProjectAccessible(projectId: string, authHeader: string) {
    const projectServiceUrl = process.env.PROJECT_SERVICE_URL || 'http://project-service:3000/api/projects';
    const res = await fetch(`${projectServiceUrl}/${projectId}`, {
      headers: { Authorization: authHeader || '' },
    });
    if (!res.ok) throw new ForbiddenException('Project not found or forbidden');
  }
}
