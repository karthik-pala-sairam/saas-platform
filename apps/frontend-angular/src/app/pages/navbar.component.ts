import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="top-nav">
      <div class="nav-links">
        <a routerLink="/projects" routerLinkActive="active-link">Projects</a>
        <a routerLink="/folders" routerLinkActive="active-link">Folders</a>
        <a routerLink="/files" routerLinkActive="active-link">Files</a>
      </div>

      <div class="nav-user" *ngIf="isLoggedIn">
        <span>Welcome, {{ username }}</span>
        <button type="button" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [
    `
      .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #1d4ed8;
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 10px 24px rgba(29, 78, 216, 0.2);
        gap: 12px;
        flex-wrap: wrap;
      }

      .nav-links {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .top-nav a {
        color: #dbeafe;
        text-decoration: none;
        font-weight: 600;
        padding: 8px 10px;
        border-radius: 8px;
      }

      .top-nav a:hover,
      .top-nav a.active-link {
        color: #fff;
        background: rgba(255, 255, 255, 0.16);
      }

      .nav-user {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #eff6ff;
        flex-wrap: wrap;
      }

      @media (max-width: 700px) {
        .top-nav {
          align-items: flex-start;
        }

        .nav-user {
          width: 100%;
          justify-content: space-between;
        }
      }

      button {
        border: none;
        background: #fff;
        color: #1d4ed8;
        padding: 7px 12px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  username: string | null = null;

  constructor(private keycloak: KeycloakService, private router: Router) {}

  async ngOnInit() {
    this.isLoggedIn = await this.keycloak.isLoggedIn();

    if (this.isLoggedIn) {
      const profile = await this.keycloak.loadUserProfile();
      this.username = profile.firstName
        ? `${profile.firstName} ${profile.lastName ?? ''}`.trim()
        : profile.username ?? profile.email ?? 'User';
    }
  }

  async logout() {
    await this.keycloak.logout(window.location.origin);
    this.router.navigate(['/']);
  }
}
