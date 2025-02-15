import { useStampsStore } from '/@/store/entities/stamps'
import { buildFilePath } from '/@/lib/apis'

export const useDanmakuSparkle = (
  showSparkle: (stampElement: HTMLElement) => void
) => {
  const { stampsMap } = useStampsStore()

  const sparkle = (stampId: string) => {
    const fileId = stampsMap.value.get(stampId)?.fileId
    const imageUrl = fileId ? buildFilePath(fileId) : ''

    const stampImage = document.createElement('img')
    stampImage.src = imageUrl
    stampImage.style.width = '24px'
    stampImage.addEventListener('load', () => {
      showSparkle(stampImage)
    })

    return stampImage
  }

  return { sparkle }
}
