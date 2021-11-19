export const getUserAudio = async (deviceId?: string) => {
  const baseAudioConstraint: MediaTrackConstraints = {
    echoCancellation: true,
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
