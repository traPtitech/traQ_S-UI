import type Pica from 'pica'

interface ResizeVars {
  pica: Pica
  $input: HTMLCanvasElement
  $output: HTMLCanvasElement
  $img: HTMLImageElement
}

// 使いまわす
let resizeVars: ResizeVars | null = null
let resizing = false
const persistTime = 3000 // ms

const loadPica = async () => {
  const Pica = (await import('pica')).default
  return new Pica()
}

// 存在しなかったらつくる
export const initVars = async (): Promise<ResizeVars> => {
  if (resizeVars !== null) return resizeVars

  resizeVars = {
    pica: await loadPica(),
    $input: document.createElement('canvas'),
    $output: document.createElement('canvas'),
    $img: new Image()
  }

  setTimeout(deinitVars, persistTime)

  return resizeVars
}
// 使っていないときに消す
export const deinitVars = () => {
  if (resizing) {
    setTimeout(deinitVars, persistTime)
    return
  }
  resizeVars = null
}

// リサイズ中に消さないようにする
export const start = () => {
  resizing = true
}
// リサイズ後にリサイズ中に消さないようにするフラグを消す
export const finish = <T>(output: T, inputUrl: string): T => {
  URL.revokeObjectURL(inputUrl)
  resizing = false
  return output
}
