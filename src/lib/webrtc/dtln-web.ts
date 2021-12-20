import type { sampleRate as _dtlnSampleRate } from '@sapphi-red/dtln-web'

// そのまま使うと全部バンドルされてしまうので、型だけ読み込んで同じ値であることを保証する
export const dtlnSampleRate: typeof _dtlnSampleRate = 16000
