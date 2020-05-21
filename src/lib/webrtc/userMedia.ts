export const getUserAudio = async (deviceId?: string) => {
  const baseAudioConstraint: MediaTrackConstraints = {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true
  }
  const constraint: MediaStreamConstraints = deviceId
    ? { audio: { ...baseAudioConstraint, deviceId }, video: false }
    : { audio: baseAudioConstraint, video: false }
  const rawAudio = await navigator.mediaDevices.getUserMedia(constraint)
  return rawAudio
}

interface ExtendedMediaDevices extends MediaDevices {
  getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>
}

export const getUserDisplay = async () => {
  const rawVideo = await (navigator.mediaDevices as ExtendedMediaDevices).getDisplayMedia(
    {
      audio: false,
      video: true
    }
  )
  return rawVideo
}
