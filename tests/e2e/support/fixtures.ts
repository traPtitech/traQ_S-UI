import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

interface Credentials {
  username: string
  password: string
}

export const test = base.extend<{
  credentials: Credentials
  authenticatedPage: Page
}>({
  // eslint-disable-next-line no-empty-pattern
  credentials: async ({}, use) => {
    const username = process.env['E2E_USERNAME']
    const password = process.env['E2E_PASSWORD']
    if (!username || !password) {
      throw new Error(
        'Set E2E_USERNAME and E2E_PASSWORD to run authenticated E2E tests'
      )
    }
    await use({ username, password })
  },
  authenticatedPage: async ({ page, context, credentials }, use) => {
    const response = await context.request.post('/api/v3/login', {
      data: { name: credentials.username, password: credentials.password }
    })
    expect(response.status()).toBe(204)
    await use(page)
    await context.request.post('/api/v3/logout')
  }
})

export { expect }
