import { randomUUID } from 'node:crypto'

import { getBackendOrigin } from './config'
import { initialMessage, userBio } from './support/testData'
import type { TestData } from './support/testData'

export const seed = async (): Promise<TestData> => {
  const backendOrigin = getBackendOrigin()
  const id = randomUUID().replaceAll('-', '').slice(0, 12)
  const data: TestData = {
    username: `e2e_${id}`,
    password: 'e2e-test-password',
    channelName: `e2e-${id}`
  }
  let cookie = ''

  const request = async <T = void>(
    method: string,
    path: string,
    body?: object
  ): Promise<T> => {
    const response = await fetch(`${backendOrigin}/api/v3${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'error',
      signal: AbortSignal.timeout(10_000)
    })
    if (!response.ok) {
      throw new Error(
        `E2E seed ${method} ${path}: ${response.status} ${await response.text()}`
      )
    }

    const sessionCookie = response.headers
      .getSetCookie()
      .find(value => value.startsWith('r_session='))
    if (sessionCookie) cookie = sessionCookie.split(';')[0] ?? ''

    return response.status === 204 ? (undefined as T) : response.json()
  }

  await request('POST', '/login', { name: 'traq', password: 'traq' })
  await request('POST', '/users', {
    name: data.username,
    password: data.password
  })
  await request('POST', '/logout')
  await request('POST', '/login', {
    name: data.username,
    password: data.password
  })
  const channel = await request<{ id: string }>('POST', '/channels', {
    name: data.channelName
  })
  await request('PATCH', '/users/me', {
    bio: userBio,
    homeChannel: channel.id
  })
  await request('POST', `/channels/${channel.id}/messages`, {
    content: initialMessage
  })
  await request('POST', '/logout')
  return data
}
