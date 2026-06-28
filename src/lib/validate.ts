export const isValidTwitter = (screenName: string) =>
  /^[a-zA-Z0-9_]{1,15}$/.test(screenName)

export const isValidStampName = (name: string) =>
  /^[a-zA-Z0-9_-]{1,32}$/.test(name)

export const isValidChannelName = (name: string) =>
  /^[a-zA-Z0-9-_]{1,20}$/.test(name)

export const isValidGroupName = (name: string) =>
  // eslint-disable-next-line no-irregular-whitespace
  /^[^@＠#＃:： 　]*$/.test(name) // @, #, :, 空白 (全角・半角) は使用不可

export const MESSAGE_MAX_LENGTH = 10000

export const INVALID_GROUP_NAME_ERROR_MESSAGE =
  '「@」「#」「:」と空白は使用できません'
