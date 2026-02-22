import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private keycloak: KeycloakService) {}

 login(): Promise<void> {
  return this.keycloak.login({
    redirectUri: window.location.origin
  });
}

  logout(): Promise<void> {
    return this.keycloak.logout(window.location.origin);
  }

  getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }
}