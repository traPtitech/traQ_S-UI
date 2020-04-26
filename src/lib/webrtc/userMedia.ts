export const getUserAudio = async (deviceId?: string) => {
  const baseAudioConstraint = {
    audioGainControl: true,
    echoCancellation: true,
    noiseSuppression: true
  }
  const constraint = deviceId
    ? { audio: { ...baseAudioConstraint, deviceId }, video: false }
    : { audio: baseAudioConstraint, video: false }
  const rawAudio = await navigator.mediaDevices.getUserMedia(constraint)
  return rawAudio
}

export const getUserDisplay = async () => {
  const rawVideo = await (navigator.mediaDevices as any).getDisplayMedia({
    audio: false,
    video: true
  })
  return rawVideo
}
