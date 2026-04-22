import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'team' | 'enterprise';
  maxUsers: number;
  maxProjects: number;
  features: string[];
  createdAt: number;
  settings: {
    requireSSO: boolean;
    allowedDomains: string[];
    auditEnabled: boolean;
    dataRetention: number; // days
  };
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  orgId: string;
  lastActive: number;
  joinedAt: number;
  permissions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ip: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
}

export interface SSOConfig {
  provider: 'saml' | 'oidc' | 'ldap';
  enabled: boolean;
  config: {
    entryPoint?: string;
    issuer?: string;
    cert?: string;
    clientId?: string;
    clientSecret?: string;
    authorizationURL?: string;
    tokenURL?: string;
    userInfoURL?: string;
    ldapUrl?: string;
    bindDN?: string;
    bindCredentials?: string;
    searchBase?: string;
    searchFilter?: string;
  };
}

interface EnterpriseState {
  org: Organization | null;
  members: TeamMember[];
  auditLogs: AuditLog[];
  ssoConfig: SSOConfig | null;
  currentUser: TeamMember | null;
  isAuthenticated: boolean;
}

interface EnterpriseActions {
  // Organization
  createOrg: (name: string, domain: string) => void;
  updateOrg: (updates: Partial<Organization>) => void;
  deleteOrg: () => void;
  
  // Members
  inviteMember: (email: string, role: UserRole) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: UserRole) => void;
  updateMemberPermissions: (id: string, permissions: string[]) => void;
  
  // SSO
  configureSSO: (config: SSOConfig) => void;
  toggleSSO: (enabled: boolean) => void;
  
  // Audit
  logAction: (action: Omit<AuditLog, 'id' | 'timestamp' | 'ip'>) => void;
  getAuditLogs: (filters?: {
    userId?: string;
    action?: string;
    startDate?: number;
    endDate?: number;
    severity?: AuditLog['severity'];
  }) => AuditLog[];
  exportAuditLogs: (format: 'json' | 'csv') => string;
  
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  loginWithSSO: () => Promise<boolean>;
  logout: () => void;
  
  // Permissions
  hasPermission: (permission: string) => boolean;
  canAccessResource: (resource: string, action: string) => boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],
  manager: [
    'read:*',
    'write:projects',
    'write:shots',
    'manage:members',
    'read:analytics',
    'export:*',
  ],
  editor: [
    'read:projects',
    'write:projects',
    'read:shots',
    'write:shots',
    'export:projects',
  ],
  viewer: [
    'read:projects',
    'read:shots',
    'export:projects',
  ],
};

export const useEnterpriseStore = create<EnterpriseState & EnterpriseActions>()(
  persist(
    (set, get) => ({
      org: null,
      members: [],
      auditLogs: [],
      ssoConfig: null,
      currentUser: null,
      isAuthenticated: false,

      createOrg: (name, domain) => {
        const org: Organization = {
          id: `org-${Date.now()}`,
          name,
          domain,
          plan: 'team',
          maxUsers: 10,
          maxProjects: 50,
          features: ['sso', 'audit', 'analytics', 'api'],
          createdAt: Date.now(),
          settings: {
            requireSSO: false,
            allowedDomains: [domain],
            auditEnabled: true,
            dataRetention: 365,
          },
        };
        set({ org });
      },

      updateOrg: (updates) => {
        set(state => ({
          org: state.org ? { ...state.org, ...updates } : null,
        }));
      },

      deleteOrg: () => {
        set({ org: null, members: [], auditLogs: [] });
      },

      inviteMember: (email, role) => {
        const member: TeamMember = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role,
          orgId: get().org?.id || '',
          lastActive: Date.now(),
          joinedAt: Date.now(),
          permissions: ROLE_PERMISSIONS[role],
        };
        set(state => ({ members: [...state.members, member] }));
        
        get().logAction({
          userId: get().currentUser?.id || 'system',
          userName: get().currentUser?.name || 'System',
          action: 'MEMBER_INVITE',
          resource: 'member',
          resourceId: member.id,
          details: { email, role },
          severity: 'info',
        });
      },

      removeMember: (id) => {
        set(state => ({ members: state.members.filter(m => m.id !== id) }));
        get().logAction({
          userId: get().currentUser?.id || 'system',
          userName: get().currentUser?.name || 'System',
          action: 'MEMBER_REMOVE',
          resource: 'member',
          resourceId: id,
          details: {},
          severity: 'warning',
        });
      },

      updateMemberRole: (id, role) => {
        set(state => ({
          members: state.members.map(m =>
            m.id === id ? { ...m, role, permissions: ROLE_PERMISSIONS[role] } : m
          ),
        }));
        get().logAction({
          userId: get().currentUser?.id || 'system',
          userName: get().currentUser?.name || 'System',
          action: 'MEMBER_ROLE_CHANGE',
          resource: 'member',
          resourceId: id,
          details: { newRole: role },
          severity: 'info',
        });
      },

      updateMemberPermissions: (id, permissions) => {
        set(state => ({
          members: state.members.map(m =>
            m.id === id ? { ...m, permissions } : m
          ),
        }));
      },

      configureSSO: (config) => {
        set({ ssoConfig: config });
        get().logAction({
          userId: get().currentUser?.id || 'system',
          userName: get().currentUser?.name || 'System',
          action: 'SSO_CONFIGURE',
          resource: 'sso',
          resourceId: 'config',
          details: { provider: config.provider },
          severity: 'info',
        });
      },

      toggleSSO: (enabled) => {
        set(state => ({
          ssoConfig: state.ssoConfig
            ? { ...state.ssoConfig, enabled }
            : null,
        }));
      },

      logAction: (action) => {
        const log: AuditLog = {
          ...action,
          id: `audit-${Date.now()}`,
          timestamp: Date.now(),
          ip: '127.0.0.1',
        };
        set(state => ({
          auditLogs: [log, ...state.auditLogs].slice(0, 10000), // Keep last 10k
        }));
      },

      getAuditLogs: (filters = {}) => {
        let logs = get().auditLogs;
        
        if (filters.userId) {
          logs = logs.filter(l => l.userId === filters.userId);
        }
        if (filters.action) {
          logs = logs.filter(l => l.action === filters.action);
        }
        if (filters.startDate) {
          logs = logs.filter(l => l.timestamp >= filters.startDate!);
        }
        if (filters.endDate) {
          logs = logs.filter(l => l.timestamp <= filters.endDate!);
        }
        if (filters.severity) {
          logs = logs.filter(l => l.severity === filters.severity);
        }
        
        return logs;
      },

      exportAuditLogs: (format) => {
        const logs = get().auditLogs;
        
        if (format === 'json') {
          return JSON.stringify(logs, null, 2);
        }
        
        // CSV format
        const headers = ['ID', 'Timestamp', 'User', 'Action', 'Resource', 'Severity', 'Details'];
        const rows = logs.map(l => [
          l.id,
          new Date(l.timestamp).toISOString(),
          l.userName,
          l.action,
          l.resource,
          l.severity,
          JSON.stringify(l.details),
        ]);
        
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      },

      login: async (email, password) => {
        // Mock login
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const member = get().members.find(m => m.email === email);
        if (member && password === 'password') {
          set({ currentUser: member, isAuthenticated: true });
          get().logAction({
            userId: member.id,
            userName: member.name,
            action: 'LOGIN',
            resource: 'auth',
            resourceId: 'login',
            details: { method: 'password' },
            severity: 'info',
          });
          return true;
        }
        return false;
      },

      loginWithSSO: async () => {
        // Mock SSO login
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: TeamMember = {
          id: `sso-${Date.now()}`,
          email: 'user@company.com',
          name: 'SSO User',
          role: 'editor',
          orgId: get().org?.id || '',
          lastActive: Date.now(),
          joinedAt: Date.now(),
          permissions: ROLE_PERMISSIONS.editor,
        };
        
        set({ currentUser: mockUser, isAuthenticated: true });
        get().logAction({
          userId: mockUser.id,
          userName: mockUser.name,
          action: 'LOGIN',
          resource: 'auth',
          resourceId: 'login',
          details: { method: 'sso' },
          severity: 'info',
        });
        
        return true;
      },

      logout: () => {
        if (get().currentUser) {
          get().logAction({
            userId: get().currentUser!.id,
            userName: get().currentUser!.name,
            action: 'LOGOUT',
            resource: 'auth',
            resourceId: 'logout',
            details: {},
            severity: 'info',
          });
        }
        set({ currentUser: null, isAuthenticated: false });
      },

      hasPermission: (permission) => {
        const user = get().currentUser;
        if (!user) return false;
        if (user.permissions.includes('*')) return true;
        if (user.permissions.includes(permission)) return true;
        
        // Check wildcard permissions
        const [resource, action] = permission.split(':');
        return user.permissions.some(p => {
          const [pResource, pAction] = p.split(':');
          return (pResource === '*' || pResource === resource) &&
                 (pAction === '*' || pAction === action);
        });
      },

      canAccessResource: (resource, action) => {
        return get().hasPermission(`${action}:${resource}`);
      },
    }),
    {
      name: 'storyforge-enterprise',
      partialize: (state) => ({
        org: state.org,
        members: state.members,
        ssoConfig: state.ssoConfig,
        auditLogs: state.auditLogs.slice(0, 1000), // Only persist recent logs
      }),
    }
  )
);
