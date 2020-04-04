export interface S {
  isEnabled: boolean
  audioInputDeviceId: string
  audioOutputDeviceId: string
}

export const state: S = {
  isEnabled: false,
  audioInputDeviceId: '',
  audioOutputDeviceId: ''
}
