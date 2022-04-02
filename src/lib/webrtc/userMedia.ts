export const getUserAudio = async (deviceId?: string) => {
  const baseAudioConstraint: MediaTrackConstraints = {
    echoCancellation: {
      ideal: true
    },
    autoGainControl: {
      ideal: true
    },
    noiseSuppression: {
      ideal: false
    }
  }
  const rawAudio = await navigator.mediaDevices.getUserMedia({
    audio: { ...baseAudioConstraint, deviceId },
    video: false
  })
  return rawAudio
}

export const getUserDisplay = async () => {
  const rawVideo = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true
  })
  return rawVideo
}
