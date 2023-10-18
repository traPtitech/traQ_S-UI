export const isValidX = (screenName: string) =>
  /^[a-zA-Z0-9_]{1,15}$/.test(screenName)

export const isValidStampName = (name: string) =>
  /^[a-zA-Z0-9_-]{1,32}$/.test(name)

export const isValidChannelName = (name: string) =>
  /^[a-zA-Z0-9-_]{1,20}$/.test(name)

export const MESSAGE_MAX_LENGTH = 10000
