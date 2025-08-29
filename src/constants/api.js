export const API_BASE_URL = 'http://localhost:8088';

export const API_ENDPOINTS = {
  CLIENTS: '/api/clients',
  COMMANDS: '/api/commands',
  CLIENT_COMMANDS: (clientId) => `/api/clients/${clientId}/commands`,
  XSS_PAYLOAD: '/xss.js'
};