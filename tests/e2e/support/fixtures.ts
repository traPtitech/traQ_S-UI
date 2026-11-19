import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { seed } from '../seed'
import type { TestData } from './testData'

export const test = base.extend<{
  testData: TestData
  authenticatedPage: Page
}>({
  // eslint-disable-next-line no-empty-pattern
  testData: async ({}, use) => {
    await use(await seed())
  },

  authenticatedPage: async ({ page, context, testData }, use) => {
    const response = await context.request.post('/api/v3/login', {
      data: { name: testData.username, password: testData.password }
    })

    expect(response.status()).toBe(204)
    await use(page)
    await context.request.post('/api/v3/logout')
  }
})

export { expect }
