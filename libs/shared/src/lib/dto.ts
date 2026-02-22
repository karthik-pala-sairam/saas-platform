export type CreateProjectDto = { name: string };
export type CreateFolderDto = { name: string; parentId?: string | null };
export type UploadFileDto = { projectId: string; folderId?: string };
