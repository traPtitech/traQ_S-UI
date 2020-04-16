export const isMac = () => navigator.platform.includes('Mac')

export const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('edge')
}
