import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createPublicKey, verify } from 'node:crypto';

type JwtHeader = { kid?: string; alg?: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly issuer = process.env.KEYCLOAK_ISSUER || 'http://keycloak:8080/realms/saas-platform';
  private readonly audience = process.env.KEYCLOAK_AUDIENCE || 'frontend-angular';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization as string | undefined;
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');

    const token = auth.slice(7);
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) throw new UnauthorizedException('Invalid JWT');

    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8')) as JwtHeader;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as any;

    if (!this.isIssuerAccepted(payload.iss)) throw new UnauthorizedException('Invalid issuer');
    if (!this.isAudienceAccepted(payload)) throw new UnauthorizedException('Invalid audience');
    if (Date.now() / 1000 >= Number(payload.exp || 0)) throw new UnauthorizedException('Expired token');

    const jwk = await this.resolveJwk(header.kid, payload.iss);
    const key = createPublicKey({ key: jwk, format: 'jwk' as any });
    const signed = Buffer.from(`${headerB64}.${payloadB64}`);
    const sig = Buffer.from(signatureB64, 'base64url');
    const ok = verify('RSA-SHA256', signed, key, sig);
    if (!ok) throw new UnauthorizedException('Invalid signature');

    req.user = payload;
    return true;
  }

  private getAcceptedIssuers(): string[] {
    return (process.env.KEYCLOAK_ISSUER_ALIASES || this.issuer)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  private isIssuerAccepted(tokenIssuer: string): boolean {
    if (!tokenIssuer) return false;

    const configuredIssuers = this.getAcceptedIssuers();
    if (configuredIssuers.includes(tokenIssuer)) return true;

    const tokenPath = this.realmPath(tokenIssuer);
    return configuredIssuers.some((value) => this.realmPath(value) === tokenPath);
  }

  private realmPath(url: string): string {
    try {
      return new URL(url).pathname.replace(/\/+$/, '');
    } catch {
      return url;
    }
  }

  private isAudienceAccepted(payload: any): boolean {
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    return aud.includes(this.audience) || payload.azp === this.audience || payload.client_id === this.audience;
  }

  private async resolveJwk(kid: string | undefined, tokenIssuer: string): Promise<any> {
    const issuers = [tokenIssuer, ...this.getAcceptedIssuers()].filter(Boolean);
    const uniqueIssuers = [...new Set(issuers)];

    for (const issuer of uniqueIssuers) {
      try {
        const res = await fetch(`${issuer}/protocol/openid-connect/certs`);
        if (!res.ok) continue;
        const json = (await res.json()) as { keys: any[] };
        const key = json.keys.find((k) => k.kid === kid) || json.keys[0];
        if (key) return key;
      } catch {
        // Try the next issuer alias.
      }
    }

    throw new UnauthorizedException('Unable to fetch certs');
  }
}
