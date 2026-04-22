import React, { useState } from 'react';
import { useEnterpriseStore, UserRole, AuditLog } from '../../stores/enterpriseStore';
import {
  Building2,
  Users,
  Shield,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Download,
  LogOut,
  Settings,
  AlertTriangle,
  Info,
  AlertCircle,
} from 'lucide-react';

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  admin: { label: '管理员', color: 'bg-red-100 text-red-700' },
  manager: { label: '经理', color: 'bg-blue-100 text-blue-700' },
  editor: { label: '编辑', color: 'bg-green-100 text-green-700' },
  viewer: { label: '查看者', color: 'bg-gray-100 text-gray-700' },
};

const SEVERITY_ICONS = {
  info: { icon: Info, color: 'text-blue-500' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500' },
  critical: { icon: AlertCircle, color: 'text-red-500' },
};

export const EnterprisePanel: React.FC = () => {
  const enterprise = useEnterpriseStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'sso' | 'audit'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('editor');
  const [auditFilter, setAuditFilter] = useState<{
    action?: string;
    severity?: AuditLog['severity'];
  }>({});

  const handleInvite = () => {
    if (inviteEmail) {
      enterprise.inviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleExportAudit = () => {
    const csv = enterprise.exportAuditLogs('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = enterprise.getAuditLogs(auditFilter);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {enterprise.org?.name || '企业设置'}
            </h2>
            <p className="text-gray-500">
              {enterprise.org?.plan === 'enterprise' ? '企业版' : 
               enterprise.org?.plan === 'team' ? '团队版' : '免费版'}
            </p>
          </div>
        </div>
        {enterprise.currentUser && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {enterprise.currentUser.name} ({ROLE_LABELS[enterprise.currentUser.role].label})
            </span>
            <button
              onClick={() => enterprise.logout()}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="退出"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {[
          { id: 'overview', label: '概览', icon: Building2 },
          { id: 'members', label: '成员管理', icon: Users },
          { id: 'sso', label: 'SSO 设置', icon: Shield },
          { id: 'audit', label: '审计日志', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 pb-2 px-4 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!enterprise.org ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">尚未创建组织</p>
              <button
                onClick={() => enterprise.createOrg('我的团队', 'company.com')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                创建组织
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">成员数量</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enterprise.members.length} / {enterprise.org.maxUsers}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">项目限制</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enterprise.org.maxProjects}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">SSO 状态</p>
                  <p className={`text-lg font-medium ${
                    enterprise.ssoConfig?.enabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {enterprise.ssoConfig?.enabled ? '已启用' : '未启用'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  组织设置
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">要求 SSO 登录</span>
                    <button
                      onClick={() => enterprise.updateOrg({
                        settings: { ...enterprise.org.settings, requireSSO: !enterprise.org.settings.requireSSO }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enterprise.org.settings.requireSSO ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enterprise.org.settings.requireSSO ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">审计日志</span>
                    <button
                      onClick={() => enterprise.updateOrg({
                        settings: { ...enterprise.org.settings, auditEnabled: !enterprise.org.settings.auditEnabled }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enterprise.org.settings.auditEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enterprise.org.settings.auditEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">团队成员</h3>
            {enterprise.hasPermission('manage:members') && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                邀请成员
              </button>
            )}
          </div>

          <div className="space-y-2">
            {enterprise.members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded ${ROLE_LABELS[member.role].color}`}>
                    {ROLE_LABELS[member.role].label}
                  </span>
                  <span className="text-xs text-gray-400">
                    最后活跃: {new Date(member.lastActive).toLocaleDateString()}
                  </span>
                  {enterprise.hasPermission('manage:members') && member.id !== enterprise.currentUser?.id && (
                    <button
                      onClick={() => enterprise.removeMember(member.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {enterprise.members.length === 0 && (
            <p className="text-center text-gray-500 py-8">暂无团队成员</p>
          )}
        </div>
      )}

      {/* SSO Tab */}
      {activeTab === 'sso' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">单点登录 (SSO)</h3>
            <p className="text-sm text-blue-700">
              配置 SSO 允许团队成员使用企业身份提供商登录。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                提供商类型
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => {
                  enterprise.configureSSO({
                    provider: e.target.value as 'saml' | 'oidc' | 'ldap',
                    enabled: false,
                    config: {},
                  });
                }}
              >
                <option value="">选择提供商...</option>
                <option value="saml">SAML 2.0</option>
                <option value="oidc">OpenID Connect</option>
                <option value="ldap">LDAP</option>
              </select>
            </div>

            {enterprise.ssoConfig?.provider === 'saml' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Point (SSO URL)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://idp.example.com/saml/sso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuer
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://app.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certificate (X.509)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="-----BEGIN CERTIFICATE-----"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => enterprise.toggleSSO(true)}
                disabled={!enterprise.ssoConfig}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                启用 SSO
              </button>
              <button
                onClick={() => enterprise.toggleSSO(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                禁用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">审计日志</h3>
            <button
              onClick={handleExportAudit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出 CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <select
              value={auditFilter.severity || ''}
              onChange={(e) => setAuditFilter({ ...auditFilter, severity: e.target.value as AuditLog['severity'] })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">所有级别</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="critical">严重</option>
            </select>
            <input
              type="text"
              placeholder="搜索操作..."
              value={auditFilter.action || ''}
              onChange={(e) => setAuditFilter({ ...auditFilter, action: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">时间</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">用户</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">操作</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">资源</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">级别</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.slice(0, 50).map(log => {
                  const SeverityIcon = SEVERITY_ICONS[log.severity].icon;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{log.userName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.resource}</td>
                      <td className="px-4 py-3">
                        <SeverityIcon className={`w-4 h-4 ${SEVERITY_ICONS[log.severity].color}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <p className="text-center text-gray-500 py-8">暂无审计日志</p>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">邀请成员</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(ROLE_LABELS).map(([role, { label }]) => (
                    <option key={role} value={role}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterprisePanel;
