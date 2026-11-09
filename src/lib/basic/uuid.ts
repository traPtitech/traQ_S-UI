import { z } from 'zod'

export const nilUuid = '00000000-0000-0000-0000-000000000000'
export const dmParentUuid = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'

const uuidSchema = z.guid()

export const isUUID = (value: unknown): value is string =>
  uuidSchema.safeParse(value).success
