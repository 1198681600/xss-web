export const CLIENT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  CONNECTING: 'connecting'
};

export const CLIENT_ROLES = {
  VICTIM: 'victim',
  ATTACKER: 'attacker'
};

export const COMMAND_TYPES = {
  EVAL: 'eval',
  COOKIE: 'cookie',
  LOCATION: 'location',
  LOCAL_STORAGE: 'localStorage',
  SESSION_STORAGE: 'sessionStorage',
  DOM: 'dom',
  FORMS: 'forms',
  USER_AGENT: 'userAgent'
};

export const MESSAGE_TYPES = {
  COMMAND: 'command',
  RESULT: 'result',
  HEARTBEAT: 'heartbeat',
  WELCOME: 'welcome'
};

export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error'
};