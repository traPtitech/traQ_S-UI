export const masterVolumeToGain = (masterVolume: number) =>
  Math.max(0, masterVolume) * 2

type AudioContextWithSinkId = AudioContext & {
  setSinkId?: (sinkId: string) => Promise<void>
}

export const setAudioContextSinkId = async (
  context: AudioContext,
  deviceId: string
) => {
  const ctx = context as AudioContextWithSinkId
  if (typeof ctx.setSinkId !== 'function') return false
  if (ctx.state === 'closed') return false
  try {
    await ctx.setSinkId(deviceId)
    return true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Qall] failed to set the audio output device', e)
    return false
  }
}

export const userIdFromIdentity = (identity: string) => identity.slice(0, -37)

export const isSoundboardIdentity = (identity: string) =>
  identity.startsWith('soundboard-')
