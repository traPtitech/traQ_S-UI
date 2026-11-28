import {
  isSoundboardIdentity,
  masterVolumeToGain,
  userIdFromIdentity
} from '/@/lib/qall/audio'

describe('masterVolumeToGain', () => {
  it('maps the displayed percentage to the gain', () => {
    // 設定画面では 0.5 が 100%、1 が 200% と表示される
    expect(masterVolumeToGain(0.5)).toBe(1)
    expect(masterVolumeToGain(1)).toBe(2)
    expect(masterVolumeToGain(0)).toBe(0)
  })

  it('does not return a negative gain', () => {
    expect(masterVolumeToGain(-1)).toBe(0)
  })
})

describe('identity helpers', () => {
  const userId = '0193b7a5-6d5c-7c2e-8a3b-2f7f0e1a2b3c'
  const identity = `${userId}_0193b7a5-6d5c-7c2e-8a3b-2f7f0e1a2b3d`

  it('extracts the user id from an identity', () => {
    expect(userIdFromIdentity(identity)).toBe(userId)
  })

  it('detects soundboard participants', () => {
    expect(
      isSoundboardIdentity('soundboard-0193b7a5-6d5c-7c2e-8a3b-2f7f0e1a2b3d')
    ).toBe(true)
    expect(isSoundboardIdentity(identity)).toBe(false)
  })
})
