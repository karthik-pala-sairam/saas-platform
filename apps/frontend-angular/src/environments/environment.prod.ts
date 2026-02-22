export const environment = {
  production: true,

  api: {
    auth: 'http://auth-service:3000',
    projects: 'http://project-service:3000',
    files: 'http://file-service:3000'
  },

  keycloak: {
    url: 'http://keycloak:8080',
    realm: 'saas-platform',
    clientId: 'frontend-angular'
  }
};