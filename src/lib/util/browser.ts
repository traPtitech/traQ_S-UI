export const isMac = () => navigator.platform.includes('Mac')

export const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('edge')
}

export const isIOS = () => {
  const ua = navigator.userAgent
  return (
    isIOSApp() ||
    ua.includes('iPhone') ||
    ua.includes('iPod') ||
    ua.includes('iPad')
  )
}

export const isIOSApp = () => {
  return navigator.userAgent.includes('traQ-iOS')
}

export const isPWA = () => {
  return matchMedia('(display-mode: standalone)').matches
}

export const isTouchDevice = () => {
  return isIOS() || navigator.userAgent.includes('Android')
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
