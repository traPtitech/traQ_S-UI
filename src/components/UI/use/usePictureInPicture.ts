import { Ref } from '@vue/composition-api'

const usePictureInPicture = () => {
  const showPictureInPictureWindow = async (
    audioRef: Ref<HTMLAudioElement | null>,
    iconId: string
  ) => {
    if (!audioRef.value) return
    const $img = new Image()
    $img.src = `/api/v3/files/${iconId}`
    await $img.decode()

    const $canvas = document.createElement('canvas')
    $canvas.width = $canvas.height = 512
    $canvas.getContext('2d')?.drawImage($img, 0, 0, 512, 512)
    const videoStream = $canvas.captureStream()

    const audio = new Audio(audioRef.value.src)
    audio.volume = audioRef.value.volume
    audio.currentTime = audioRef.value.currentTime

    const $video = document.createElement('video')
    $video.srcObject = videoStream
    $video.muted = true
    $video.addEventListener('play', () => {
      audio.play()
    })
    $video.addEventListener('pause', () => {
      audio.pause()
    })
    $video.addEventListener('leavepictureinpicture', function () {
      $video.remove()
    })

    $video.addEventListener('loadedmetadata', async () => {
      await $video.play()
      await $video.requestPictureInPicture()
    })
    document.body.append($video)

    navigator.mediaSession.setActionHandler('play', () => {
      document.pictureInPictureElement.play()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      document.pictureInPictureElement.pause()
    })
  }
  return { showPictureInPictureWindow }
}

export default usePictureInPicture
