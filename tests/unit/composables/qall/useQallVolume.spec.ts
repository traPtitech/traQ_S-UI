import { createPinia, setActivePinia } from 'pinia'

import {
  clearParticipantVolumes,
  useQallVolume
} from '/@/composables/qall/useQallVolume'

const userVolumes = new Map<string, number>()

vi.mock('/@/store/app/userVolume', () => ({
  useUserVolume: () => ({
    getStore: (userId: string) => userVolumes.get(userId),
    setStore: (userId: string, volume: number) => {
      userVolumes.set(userId, volume)
    }
  })
}))

describe('useQallVolume', () => {
  const pc = { userName: 'user', identity: 'user_pc' }
  const phone = { userName: 'user', identity: 'user_phone' }

  beforeEach(() => {
    setActivePinia(createPinia())
    userVolumes.clear()
    clearParticipantVolumes()
  })

  it('defaults to 1', () => {
    const { getVolume } = useQallVolume()
    expect(getVolume(pc)).toBe(1)
  })

  it('saves the volume per user when not per device', () => {
    const { getVolume, setVolume } = useQallVolume()
    setVolume(pc, 0.5, { perDevice: false })

    expect(userVolumes.get('user')).toBe(0.5)
    expect(getVolume(phone)).toBe(0.5)
  })

  it('keeps per device volumes only for that device and only during the call', () => {
    const { getVolume, setVolume } = useQallVolume()
    setVolume(pc, 0.5, { perDevice: false })
    setVolume(phone, 1.5, { perDevice: true })

    expect(getVolume(phone)).toBe(1.5)
    expect(getVolume(pc)).toBe(0.5)
    expect(userVolumes.get('user')).toBe(0.5)

    clearParticipantVolumes()
    expect(getVolume(phone)).toBe(0.5)
  })

  it('drops the per device volume when the user volume is set again', () => {
    const { getVolume, setVolume } = useQallVolume()
    setVolume(phone, 1.5, { perDevice: true })
    setVolume(phone, 0.8, { perDevice: false })

    expect(getVolume(phone)).toBe(0.8)
  })
})
