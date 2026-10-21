import { describe, expect, it, vi } from 'vitest'

import useMarkdownInternalHandler from '../../../../src/composables/markdown/useMarkdownInternalHandler'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
    resolve: () => ({ matched: [{ name: 'channel' }] })
  })
}))
vi.mock('/@/router', () => ({ RouteName: { NotFound: 'not-found' } }))
vi.mock('/@/lib/apis', () => ({ embeddingOrigin: 'https://example.com' }))

const clickLink = (onClick: (event: MouseEvent) => void) => {
  const body = document.createElement('div')
  body.className = 'markdown-body'
  const anchor = document.createElement('a')
  anchor.href = 'https://example.com/channels/test'
  anchor.target = '_blank'
  body.append(anchor)
  body.addEventListener('click', onClick)
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true
  })
  anchor.dispatchEvent(event)
  return event
}

describe('useMarkdownInternalHandler', () => {
  it('waits for modal cleanup before navigating', async () => {
    let finish!: () => void
    const beforeNavigate = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve
        })
    )
    const { onClick } = useMarkdownInternalHandler(beforeNavigate)
    const event = clickLink(onClick)

    expect(event.defaultPrevented).toBe(true)
    expect(beforeNavigate).toHaveBeenCalledOnce()
    expect(push).not.toHaveBeenCalled()

    finish()
    await Promise.resolve()
    expect(push).toHaveBeenCalledWith('/channels/test')
  })
})
