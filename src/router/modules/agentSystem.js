/**
 * 代理系统（/agent-system），与 /admin、/front 平级。
 * 守卫：router/index.js（agentRequiresAuth / agentGuestOnly）
 */
export const agentSystemRoutes = [
  {
    path: '/agent-system/login',
    name: 'agent-login',
    component: () => import('../../pages/agent-system/AgentLoginPage.vue'),
    meta: { title: '代理登录', agentGuestOnly: true }
  },
  {
    path: '/agent-system',
    component: () => import('../../layouts/AgentSystemShellLayout.vue'),
    meta: { agentRequiresAuth: true },
    children: [
      { path: '', redirect: '/agent-system/dashboard' },
      {
        path: 'dashboard',
        name: 'agent-dashboard',
        component: () => import('../../pages/agent-system/AgentDashboardPage.vue'),
        meta: { title: '概览' }
      },
      {
        path: 'data-query',
        name: 'agent-data-query',
        component: () => import('../../pages/agent-system/AgentDataQueryPage.vue'),
        meta: { title: '数据查询' }
      },
      {
        path: 'daily-report',
        name: 'agent-daily-report',
        component: () => import('../../pages/agent-system/AgentDailyReportPage.vue'),
        meta: { title: '数据日报' }
      },
      {
        path: 'verification-audit',
        name: 'agent-verification-audit',
        component: () => import('../../pages/agent-system/AgentVerificationAuditPage.vue'),
        meta: { title: '认证审核' }
      },
      {
        path: 'team',
        name: 'agent-team',
        component: () => import('../../pages/agent-system/AgentTeamPage.vue'),
        meta: { title: '团队管理' }
      },
      {
        path: 'commission-rates',
        name: 'agent-commission-rates',
        component: () => import('../../pages/agent-system/AgentCommissionRatesPage.vue'),
        meta: { title: '记佣比例' }
      },
      {
        path: 'commission',
        name: 'agent-commission',
        component: () => import('../../pages/agent-system/AgentCommissionPage.vue'),
        meta: { title: '佣金结算' }
      },
      {
        path: 'settings',
        name: 'agent-settings',
        component: () => import('../../pages/agent-system/AgentSettingsPage.vue'),
        meta: { title: '账户设置' }
      }
    ]
  }
]
