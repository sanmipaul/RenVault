/**
 * Service Integration Barrel Export
 * Exports smart session related services
 */

export {
  SmartSessionService,
  smartSessionService,
  type CreateSessionOptions,
} from './session/smart-session.service';

export {
  SessionPermissionManager,
  sessionPermissionManager,
} from './session/session-permission-manager';

export {
  SessionActivityLogger,
  sessionActivityLogger,
} from './session/session-activity-logger';

export {
  SessionRevocationService,
  sessionRevocationService,
} from './session/session-revocation.service';

export {
  SmartSessionAnalytics,
  smartSessionAnalytics,
  type SessionAnalytics,
} from './smart-session-analytics';
