import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './pages/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <h1>SaaS Platform</h1>
      </header>

      <app-navbar></app-navbar>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        color: #0f172a;
        font-family: Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      .app-shell {
        max-width: 1100px;
        margin: 0 auto;
        padding: 24px 20px 32px;
      }

      .app-header h1 {
        margin: 0 0 16px;
        font-size: 1.9rem;
        font-weight: 700;
        color: #1e293b;
      }

      .app-main {
        margin-top: 20px;
      }
    `,
  ],
})
export class AppComponent {}
