export const isMac = () => navigator.platform.includes('Mac')

const ua = navigator.userAgent.toLowerCase()

export const isSafari = () => {
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('edge')
}

export const isIOS = () => {
  return ua.includes('iphone') || ua.includes('ipod') || ua.includes('ipad')
}

export const isFirefox = () => {
  return ua.includes('firefox')
}

type iOSAppWindow = Window & {
  iOSToken: string

  webkit: {
    messageHandlers: {
      /**
       * @see https://github.com/traPtitech/traQ-iOS/blob/d752f1dcc33ec878039605008f790c0452ba7873/traQ-R%20second/ViewController.swift#L14-L17
       * @see https://github.com/traPtitech/traQ-iOS/blob/d752f1dcc33ec878039605008f790c0452ba7873/traQ-R%20second/ViewController.swift#L220-L250
       */
      scriptMessageHandler: {
        postMessage: {
          (event: 'RequestMicrophone'): Promise<boolean>
          (event: 'RequestCamera'): Promise<boolean>
        }
      }
    }
  }
}

export const isIOSApp = (window: Window): window is iOSAppWindow => {
  return 'iOSToken' in window
}

export const isPWA = () => {
  return matchMedia('(display-mode: standalone)').matches
}

export const isTouchDevice = () => {
  return isIOS() || ua.includes('android')
}

// https://github.com/ianstormtaylor/slate/blob/7377266b43451c4be44a1442aa1076ef3d13227e/packages/slate-dev-environment/src/index.js#L74-L79
export const checkLevel2InputEventsSupport = () => {
  const element = document.createElement('div')
  element.contentEditable = 'true'
  return 'onbeforeinput' in element
}

export const checkBadgeAPISupport = () => {
  return !!navigator.setAppBadge && !!navigator.clearAppBadge
}

export const checkPinPSupport = () => {
  return document.pictureInPictureEnabled
}

export const checkMediaSessionSupport = () => {
  return !!navigator.mediaSession
}

declare global {
  interface Window {
    PasswordCredential: PasswordCredential
  }
}

export const checkCredentialManagerSupport = () => {
  return !!window.PasswordCredential
}

export const checkStorageManagerSupport = () => {
  return !!navigator.storage
}

export const checkAudioWorkletSupport = () => {
  return !!AudioWorkletNode
}
