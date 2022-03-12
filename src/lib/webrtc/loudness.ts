const talkingThreshoulds = [300, 1000, 3000, 5000]

export const getTalkingLoudnessLevel = (level: number) => {
  let ll = 0
  for (const t of talkingThreshoulds) {
    if (level < t) return ll
    ll++
  }
  return ll
}
