export const getUserAudio = async (deviceId?: string) => {
  const baseAudioConstraint: MediaTrackConstraints = {
    echoCancellation: true,
    // @ts-expect-error まだ型に追加されていないが存在する https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/autoGainControl
    autoGainControl: true,
    noiseSuppression: true
  }
  const rawAudio = await navigator.mediaDevices.getUserMedia({
    audio: { ...baseAudioConstraint, deviceId },
    video: false
  })
  return rawAudio
}

interface ExtendedMediaDevices extends MediaDevices {
  getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>
}

export const getUserDisplay = async () => {
  const rawVideo = await (
    navigator.mediaDevices as ExtendedMediaDevices
  ).getDisplayMedia({
    audio: false,
    video: true
  })
  return rawVideo
}
