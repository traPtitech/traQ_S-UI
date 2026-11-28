/**
 * マスターボリューム (設定値 0〜1) を実際のゲインに変換する
 *
 * 設定画面では設定値の 2 倍を % で表示している (0.5 が 100%、1 が 200%) ので、それに合わせる
 */
export const masterVolumeToGain = (masterVolume: number) =>
  Math.max(0, masterVolume) * 2

type AudioContextWithSinkId = AudioContext & {
  setSinkId?: (sinkId: string) => Promise<void>
}

/**
 * AudioContext の出力先を設定する
 *
 * AudioContext.setSinkId に対応していないブラウザ (Safari / Firefox など) では何もしない
 *
 * @returns 出力先を設定できたかどうか
 */
export const setAudioContextSinkId = async (
  context: AudioContext,
  deviceId: string
) => {
  const ctx = context as AudioContextWithSinkId
  if (typeof ctx.setSinkId !== 'function') return false
  if (ctx.state === 'closed') return false
  try {
    // 空文字列はブラウザの既定の出力先を表す
    await ctx.setSinkId(deviceId)
    return true
  } catch (e) {
    // 設定されたデバイスが見つからない場合などは既定の出力先のままにする
    // eslint-disable-next-line no-console
    console.warn('[Qall] failed to set the audio output device', e)
    return false
  }
}

/**
 * LiveKit の参加者の Identity (`{userId}_{uuid}`) からユーザーIDを取り出す
 */
export const userIdFromIdentity = (identity: string) => identity.slice(0, -37)

/**
 * サウンドボードの再生のために traQ が作る参加者かどうか
 */
export const isSoundboardIdentity = (identity: string) =>
  identity.startsWith('soundboard-')
