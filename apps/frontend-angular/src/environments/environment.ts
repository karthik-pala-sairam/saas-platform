export const environment = {
  production: false,
  api: {
    auth: 'http://localhost:3001',
    projects: 'http://localhost:3002',
    files: 'http://localhost:3003'
  },

  keycloak: {
    url: 'http://localhost:8080',
    realm: 'saas-platform',
    clientId: 'frontend-angular'
  }

};