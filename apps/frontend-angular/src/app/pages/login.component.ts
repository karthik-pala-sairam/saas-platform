import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="login-card">
      <h2>Welcome back</h2>
      <p>Authenticate with Keycloak to manage projects, folders, and files.</p>
      <button (click)="login()">Login with Keycloak</button>
    </section>
  `,
  styles: [
    `
      .login-card {
        max-width: 520px;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
        padding: 24px;
      }
      h2 { margin: 0 0 8px; }
      p { color: #475569; margin: 0 0 16px; }
      button { border:none; background:#2563eb; color:#fff; border-radius:8px; padding:10px 14px; font-weight:600; }
    `,
  ],
})
export class LoginComponent {
  constructor(private keycloak: KeycloakService) {}

  async login() {
    await this.keycloak.login({
      redirectUri: window.location.origin + '/projects',
    });
  }
}
