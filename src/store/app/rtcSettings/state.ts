export interface S {
  isEnabled: boolean
  audioInputDeviceId: string
  audioOutputDeviceId: string
  isTtsEnabled: boolean
  voiceName: string
  voicePitch: number
  voiceRate: number
  voiceVolume: number
}

export const state: S = {
  isEnabled: false,
  audioInputDeviceId: '',
  audioOutputDeviceId: '',
  isTtsEnabled: false,
  voiceName: '',
  voicePitch: 1,
  voiceRate: 1.2,
  voiceVolume: 1
}
