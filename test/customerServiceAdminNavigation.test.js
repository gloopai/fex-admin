import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { navTree } from '../src/admin/config/nav.js'
import { consoleRoutes } from '../src/router/modules/console.js'

test('adds a top-level customer service workbench menu item', () => {
  const item = navTree.find((entry) => entry.path === '/admin/customer-service/workbench')

  assert.deepEqual(item, {
    title: '客服管理',
    icon: 'customer-service',
    path: '/admin/customer-service/workbench'
  })
})

test('registers the admin customer service workbench route', () => {
  const route = consoleRoutes.find((entry) => entry.name === 'customer-service-workbench')

  assert.ok(route)
  assert.equal(route.path, 'customer-service/workbench')
  assert.equal(route.meta.title, '客服管理 / 操作面板')
})

test('keeps the customer service composer free of quick replies', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/customer-service/CustomerServiceWorkbenchPage.vue', import.meta.url),
    'utf8'
  )

  assert.doesNotMatch(source, /quickReplies|useQuickReply/)
  assert.doesNotMatch(source, /您好，已收到您的问题|请稍等，我正在为您查询|感谢您的耐心等待/)
})

test('reuses the user management detail drawer in customer service', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/customer-service/CustomerServiceWorkbenchPage.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /import UserDetailDrawer from/)
  assert.match(source, /<UserDetailDrawer/)
  assert.doesNotMatch(source, /aria-label="客服用户信息"/)
})

test('presents customer service as a user inbox without conversation lifecycle controls', () => {
  const source = readFileSync(
    new URL('../src/pages/admin/customer-service/CustomerServiceWorkbenchPage.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /用户消息/)
  assert.match(source, /新消息/)
  assert.match(source, /全部用户/)
  assert.doesNotMatch(source, /结束会话|待回复|待用户|已结束/)
})

test('uses the shared image preview in both customer service surfaces', () => {
  const adminSource = readFileSync(
    new URL('../src/pages/admin/customer-service/CustomerServiceWorkbenchPage.vue', import.meta.url),
    'utf8'
  )
  const frontSource = readFileSync(
    new URL('../src/pages/front/FrontCustomerServicePage.vue', import.meta.url),
    'utf8'
  )

  for (const source of [adminSource, frontSource]) {
    assert.match(source, /import CustomerServiceImagePreview from/)
    assert.match(source, /<CustomerServiceImagePreview/)
    assert.match(source, /@click="previewImage\(message\.imageDataUrl\)"/)
  }
})
