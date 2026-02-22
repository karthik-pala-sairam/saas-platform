import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const roles = this.extractRoles(req.user, process.env.KEYCLOAK_AUDIENCE || 'frontend-angular');

    if (required.every((r) => roles.includes(r))) return true;

    // Treat authenticated users as baseline saas-user in this dev setup
    // so endpoints work even when role mappers are missing from tokens.
    if (this.hasBaselineUserRole(req.user, required)) return true;

    throw new ForbiddenException('Insufficient role');
  }

  private hasBaselineUserRole(user: any, required: string[]): boolean {
    const isAuthenticated = Boolean(user?.sub);
    if (!isAuthenticated) return false;

    const baselineRoles = new Set(['saas-user']);
    return required.every((role) => baselineRoles.has(role));
  }

  private extractRoles(user: any, audience: string): string[] {
    const realmRoles: string[] = user?.realm_access?.roles ?? [];
    const directRoles: string[] = Array.isArray(user?.roles) ? user.roles : [];
    const resourceAccess = user?.resource_access ?? {};
    const clientRoles: string[] = [
      ...(resourceAccess[audience]?.roles ?? []),
      ...(resourceAccess.account?.roles ?? []),
    ];

    return [...new Set([...realmRoles, ...directRoles, ...clientRoles])];
  }
}
