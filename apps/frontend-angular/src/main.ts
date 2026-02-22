import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { APP_INITIALIZER } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

function initializeKeycloak(keycloak: KeycloakService, config: any) {
  return () =>
    keycloak.init({
      config: config.keycloak,
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
    });
}

fetch('/assets/config.json')
  .then(res => res.json())
  .then(config => {
    bootstrapApplication(AppComponent, {
      providers: [
        provideRouter(routes),
        KeycloakService,
        {
          provide: APP_INITIALIZER,
          useFactory: (keycloak: KeycloakService) =>
            initializeKeycloak(keycloak, config),
          deps: [KeycloakService],
          multi: true,
        },
      ],
    });
  })
  .catch(err => {
    console.error('Failed to load config.json or initialize Keycloak', err);
    alert('Authentication service is currently unavailable. Please try again later.');
  });