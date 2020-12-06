export const isValidTwitter = (screenName: string) =>
  /^[a-zA-Z0-9_]{1,15}$/.test(screenName)

export const isValidStampName = (name: string) =>
  /^[a-zA-Z0-9_-]{1,32}$/.test(name)
