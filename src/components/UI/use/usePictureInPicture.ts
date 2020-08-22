import { Ref } from '@vue/composition-api'

const usePictureInPicture = () => {
  const showPictureInPictureWindow = async (
    audioRef: Ref<HTMLAudioElement | null>,
    iconId: string,
    play: () => void,
    pause: () => void
  ) => {
    if (!audioRef.value) return
    const $img = new Image()
    $img.src = `/api/v3/files/${iconId}`
    await $img.decode()

    const $canvas = document.createElement('canvas')
    $canvas.width = $canvas.height = 512
    $canvas.getContext('2d')?.drawImage($img, 0, 0, 512, 512)

    const $audio = document.createElement('audio')
    $audio.src = audioRef.value.src
    $audio.volume = audioRef.value.volume
    $audio.currentTime = audioRef.value.currentTime

    const videoStream = $canvas.captureStream()
    ;[...$audio.captureStream().getAudioTracks()].forEach(track => {
      videoStream.addTrack(track)
    })
    const $video = document.createElement('video')
    $video.srcObject = videoStream
    $video.style.display = 'none'
    $video.addEventListener('play', () => play())
    $video.addEventListener('pause', () => pause())
    $video.addEventListener('leavepictureinpicture', function () {
      pause()
      $canvas.remove()
      $video.remove()
      $audio.remove()
    })

    $video.onloadedmetadata = async function () {
      await $video.requestPictureInPicture()
      await $video.play()
    }
    document.body.append($video)

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (document.pictureInPictureElement) {
          document.pictureInPictureElement.play()
        }
      })

      navigator.mediaSession.setActionHandler('pause', () => {
        if (document.pictureInPictureElement) {
          document.pictureInPictureElement.pause()
        }
      })
    }
  }
  return { showPictureInPictureWindow }
}

export default usePictureInPicture
