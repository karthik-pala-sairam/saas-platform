# SaaS Platform Monorepo

This repository contains a small SaaS-style platform built as an Nx monorepo with:

- **Frontend**: Angular app (`frontend-angular`)
- **Backend microservices**: NestJS services for auth, projects, and files
- **Infrastructure**: Keycloak (auth), Postgres, and MinIO via Docker Compose

The current implementation provides a working Phase 1 baseline for authenticated project/folder/file flows.

## Monorepo structure

- `apps/frontend-angular` — Angular UI
- `apps/auth-service` — user identity API (`/api/auth/me`) backed by Keycloak JWT validation
- `apps/project-service` — project + folder APIs
- `apps/file-service` — upload/list/metadata/download APIs
- `libs/auth` — shared NestJS auth guards/decorators (JWT + role guard)
- `libs/shared` — shared DTO/types
- `docker-compose.yml` — local full-stack runtime
- `docker/keycloak-realm.json` — seeded Keycloak realm/client/user

## Architecture at a glance

```text
Angular (4200)
  ├─> auth-service (3001)
  ├─> project-service (3002)
  └─> file-service (3003)

auth-service/project-service/file-service
  └─ validate JWT against Keycloak realm

project-service <-> file-service (ownership/project access checks)

Infra:
  - Keycloak: 8080
  - Postgres: 5432
  - MinIO API: 9000, Console: 9001
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Quick start (recommended)

Run the complete platform with one command:

```bash
docker compose up --build
```

Once startup finishes:

- Frontend: `http://localhost:4200`
- Keycloak Admin: `http://localhost:8080` (admin/admin)
- MinIO Console: `http://localhost:9001` (minioadmin/minioadmin)

### Test user (seeded)

The imported Keycloak realm includes:

- Username: `testuser`
- Password: `password`
- Role: `saas-user`

## Running services with Nx (without Docker for apps)

If you want to run applications directly with Nx, start dependencies first (Keycloak/Postgres/MinIO), then run:

```bash
npx nx serve auth-service
npx nx serve project-service
npx nx serve file-service
npx nx serve frontend-angular
```

Build all apps:

```bash
npx nx run-many -t build --projects=frontend-angular,auth-service,project-service,file-service
```

Show project graph:

```bash
npx nx graph
```

## API surface (high level)

### auth-service (`/api/auth`)

- `GET /me` — returns authenticated user claims
- `GET /health` — health check

### project-service (`/api/projects`)

- `GET /` — list current user projects
- `POST /` — create project
- `GET /:projectId` — get project by id (owner-scoped)
- `GET /:projectId/folders` — get nested folder tree
- `POST /:projectId/folders` — create folder

### file-service (`/api/files`)

- `POST /upload` — upload file (`multipart/form-data`, `file`, `projectId`, optional `folderId`)
- `GET /project/:projectId` — list files for a project
- `GET /:id/metadata` — file metadata
- `GET /:id/download` — file download
- `GET /health` — health check

## Configuration notes

Frontend runtime API and Keycloak URLs are configured in:

- `apps/frontend-angular/src/assets/config.json`

Docker compose sets the service environment variables for local integration in:

- `docker-compose.yml`

## Current limitations

This repo is functional for local/demo usage, but not production-hardened yet:

- Project and file metadata persistence currently uses local `/tmp/*.json` files in services.
- Uploaded files are currently copied to local disk (`/tmp/file-storage`) rather than MinIO object storage.
- Validation/error modeling is basic and should be strengthened for production.

See `docs/requirement-gap-analysis.md` for a detailed gap breakdown.

## Useful commands

```bash
# list projects
npx nx show projects

# build one app
npx nx build project-service

# run tests for a project (if present)
npx nx test <project-name>

# format check/fix (workspace-wide)
npx nx format:check
npx nx format:write
```

---

If you're onboarding, start with **Quick start (recommended)** and log in as `testuser` to validate the end-to-end flow.
