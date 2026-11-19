import type { Stamp } from '@traptitech/traq'

import { ref } from 'vue'

import { createPinia } from 'pinia'

import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useStampsStore } from '/@/store/entities/stamps'

type RecommendationsResponse = {
  data: { stampId: string; score: number }[]
}

const { mockGetMyStampRecommendations } = vi.hoisted(() => ({
  mockGetMyStampRecommendations: vi.fn<() => Promise<RecommendationsResponse>>()
}))

vi.mock('/@/lib/apis', () => ({
  default: { getMyStampRecommendations: mockGetMyStampRecommendations }
}))
vi.mock('/@/store/entities/stamps', () => ({
  useStampsStore: vi.fn()
}))

describe('useStampRecommendations', () => {
  beforeEach(() => {
    mockGetMyStampRecommendations.mockReset()
    vi.mocked(useStampsStore, { partial: true }).mockReturnValue({
      stampsMap: ref(
        new Map<string, Stamp>(
          ['a', 'b'].map(id => [
            id,
            {
              id,
              name: id,
              fileId: `${id}-file`,
              creatorId: 'user',
              isUnicode: false,
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z'
            }
          ])
        )
      )
    })
  })

  it('shares concurrent requests and caches the completed result', async () => {
    const request = Promise.withResolvers<RecommendationsResponse>()
    mockGetMyStampRecommendations.mockReturnValueOnce(request.promise)
    const store = useStampRecommendations(createPinia())

    const first = store.fetchStampRecommendations()
    const second = store.fetchStampRecommendations()
    const forced = store.fetchStampRecommendations({ ignoreCache: true })
    expect(mockGetMyStampRecommendations).toHaveBeenCalledOnce()

    request.resolve({
      data: [
        { stampId: 'a', score: 1 },
        { stampId: 'b', score: 2 }
      ]
    })
    await Promise.all([first, second, forced])
    expect(store.stampRecommendations.value).toEqual(['b', 'a'])
    await store.fetchStampRecommendations()
    expect(mockGetMyStampRecommendations).toHaveBeenCalledOnce()
  })

  it('can explicitly refresh a completed request', async () => {
    mockGetMyStampRecommendations.mockResolvedValue({ data: [] })
    const store = useStampRecommendations(createPinia())

    await store.fetchStampRecommendations()
    await store.fetchStampRecommendations({ ignoreCache: true })

    expect(mockGetMyStampRecommendations).toHaveBeenCalledTimes(2)
  })

  it('can retry after a shared request fails', async () => {
    const request = Promise.withResolvers<RecommendationsResponse>()
    mockGetMyStampRecommendations.mockReturnValueOnce(request.promise)
    const store = useStampRecommendations(createPinia())

    const first = expect(store.fetchStampRecommendations()).rejects.toThrow(
      'network error'
    )
    const second = expect(store.fetchStampRecommendations()).rejects.toThrow(
      'network error'
    )
    request.reject(new Error('network error'))
    await Promise.all([first, second])

    mockGetMyStampRecommendations.mockResolvedValueOnce({ data: [] })
    await store.fetchStampRecommendations()

    expect(mockGetMyStampRecommendations).toHaveBeenCalledTimes(2)
  })
})
