import test from 'node:test'
import assert from 'node:assert/strict'

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
