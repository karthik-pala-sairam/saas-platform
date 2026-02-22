import { Controller, Get } from '@nestjs/common';
import { CurrentUser, Roles } from '@saas-platform/auth';

@Controller('auth')
export class AuthController {
  @Get('me')
  @Roles('saas-user')
  me(@CurrentUser() user: Record<string, unknown>) {
    return {
      sub: user.sub,
      preferred_username: user.preferred_username,
      email: user.email,
      roles: (user.realm_access as { roles?: string[] } | undefined)?.roles ?? [],
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
