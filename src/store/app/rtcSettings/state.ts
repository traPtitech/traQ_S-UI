export interface S {
  isEnabled: boolean
  masterVolume: number
  audioInputDeviceId: string
  audioOutputDeviceId: string
  isNoiseReductionEnabled: boolean
  isEchoCancellationEnabled: boolean
  isTtsEnabled: boolean
  voiceName: string
  voicePitch: number
  voiceRate: number
  voiceVolume: number
}

export const state: S = {
  isEnabled: true,
  masterVolume: 0.5,
  audioInputDeviceId: '',
  audioOutputDeviceId: '',
  isNoiseReductionEnabled: false,
  isEchoCancellationEnabled: false,
  isTtsEnabled: false,
  voiceName: '',
  voicePitch: 1,
  voiceRate: 1.2,
  voiceVolume: 1
}
