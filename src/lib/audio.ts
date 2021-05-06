export const destroyAudio = (audio: HTMLAudioElement) => {
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
}
