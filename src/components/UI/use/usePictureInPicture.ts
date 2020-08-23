import { Ref } from '@vue/composition-api'

const usePictureInPicture = () => {
  const showPictureInPictureWindow = async (
    audioRef: Ref<HTMLAudioElement | null>,
    iconId: string,
    duration: Ref<number>,
    onTimeUpdateCallback: (currentTime: number) => void
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
    const onTimeUpdate = () => {
      onTimeUpdateCallback(audio.currentTime)
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', () => {
      duration.value = Math.floor(audio.duration)
    })

    const $video = document.createElement('video')
    $video.srcObject = videoStream
    $video.muted = true
    $video.style.display = 'none'
    $video.addEventListener('play', () => {
      audio.play()
    })
    $video.addEventListener('pause', () => {
      audio.pause()
    })
    $video.addEventListener('leavepictureinpicture', () => {
      $video.remove()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.pause()
      audio.src = ''
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
    })

    $video.addEventListener('enterpictureinpicture', () => {
      navigator.mediaSession.setActionHandler('play', () => {
        document.pictureInPictureElement.play()
        navigator.mediaSession.playbackState = 'playing'
      })
      navigator.mediaSession.setActionHandler('pause', () => {
        document.pictureInPictureElement.pause()
        navigator.mediaSession.playbackState = 'paused'
      })
    })
    $video.addEventListener('loadedmetadata', async () => {
      await $video.play()
      await $video.requestPictureInPicture()
    })
    document.body.append($video)
  }
  return { showPictureInPictureWindow }
}

export default usePictureInPicture
