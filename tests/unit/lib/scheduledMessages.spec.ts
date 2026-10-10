import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { vi } from 'vitest'

import {
  downloadScheduledAttachments,
  scheduledMessageApis,
  toLocalDateTimeInput
} from '/@/lib/scheduledMessages'

afterEach(() => vi.restoreAllMocks())

describe('scheduled messages', () => {
  it('formats the native datetime input in local time', () => {
    expect(toLocalDateTimeInput(new Date(2026, 9, 10, 9, 5))).toBe(
      '2026-10-10T09:05'
    )
  })

  it('uploads to the private endpoint with the original channel and file', async () => {
    const post = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { id: 'private-file' } })
    const file = new File(['notice'], 'notice.txt', { type: 'text/plain' })
    await scheduledMessageApis.upload(file, 'channel', vi.fn())
    expect(post).toHaveBeenCalledOnce()
    const [path, body] = post.mock.calls.at(0) ?? []
    expect(path).toBe('/api/v3/users/me/scheduled-messages/files')
    expect((body as FormData).get('channelId')).toBe('channel')
    expect(((body as FormData).get('file') as File).name).toBe('notice.txt')
  })

  it('restores the actual bytes, filename, MIME type, and attachment order', async () => {
    vi.spyOn(axios, 'get').mockImplementation(async url => {
      if (url.endsWith('/meta')) {
        return {
          data: {
            name: url.includes('image') ? 'notice.png' : 'notice.txt',
            mime: url.includes('image') ? 'image/png' : 'text/plain'
          }
        } as AxiosResponse
      }
      return {
        data: new Blob([url.includes('image') ? 'image bytes' : 'text bytes'])
      } as AxiosResponse
    })
    const attachments = await downloadScheduledAttachments(['image', 'text'])
    expect(attachments.map(a => a.file.name)).toEqual([
      'notice.png',
      'notice.txt'
    ])
    expect(attachments.map(a => a.file.type)).toEqual([
      'image/png',
      'text/plain'
    ])
    expect(await attachments.at(0)?.file.text()).toBe('image bytes')
    expect(await attachments.at(1)?.file.text()).toBe('text bytes')
  })

  it('rejects the whole download if an attachment is unavailable', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('missing attachment'))
    await expect(downloadScheduledAttachments(['file'])).rejects.toThrow(
      'missing attachment'
    )
  })
})
