import test from 'node:test'
import assert from 'node:assert/strict'

import { getFrontMainNavLinks } from '../src/constants/frontNav.js'
import {
  getPersonalCenterNavItems,
  getPersonalCenterShellMobileNavItems
} from '../src/constants/personalCenterNav.js'
import { frontDesktopRoutes } from '../src/router/modules/front.js'

test('registers customer service as an authenticated front route', () => {
  const route = frontDesktopRoutes.find((item) => item.name === 'front-customer-service')

  assert.ok(route)
  assert.equal(route.path, 'customer-service')
  assert.equal(route.meta.requiresAuth, true)
})

test('keeps customer service out of the main text navigation', () => {
  const item = getFrontMainNavLinks('/front').find((entry) => entry.key === 'customer-service')

  assert.equal(item, undefined)
})

test('adds customer service to desktop and mobile personal-center navigation', () => {
  const desktop = getPersonalCenterNavItems('/front')
  const mobile = getPersonalCenterShellMobileNavItems('/front')

  assert.equal(
    desktop.find((entry) => entry.key === 'customer-service')?.to,
    '/front/customer-service'
  )
  assert.equal(
    mobile.find((entry) => entry.key === 'customer-service')?.to,
    '/front/customer-service'
  )
})
