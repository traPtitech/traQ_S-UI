const usePictureInPicture = () => {
  const showPictureInPictureWindow = async (
    audio: HTMLAudioElement,
    iconId: string
  ) => {
    const $img = new Image()
    $img.src = `/api/v3/files/${iconId}`
    await $img.decode()

    const $canvas = document.createElement('canvas')
    $canvas.width = $canvas.height = 512
    $canvas.getContext('2d')?.drawImage($img, 0, 0, 512, 512)
    const videoStream = $canvas.captureStream()

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
      audio.pause()
      const src = audio.src
      const currentTime = audio.currentTime
      audio.src = ''
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)

      audio.src = src
      audio.currentTime = currentTime
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
