import {
  StampPaletteCreatedEvent,
  StampPaletteUpdatedEvent,
  StampPaletteDeletedEvent
} from './events'

export const onStampPaletteCreated = async (data: StampPaletteCreatedEvent) => {
  // eslint-disable-next-line no-console
  console.error('onStampPaletteCreated: Not implemented')
}

export const onStampPaletteUpdated = async (data: StampPaletteUpdatedEvent) => {
  // eslint-disable-next-line no-console
  console.error('onStampPaletteUpdated: Not implemented')
}

export const onStampPaletteDeleted = (data: StampPaletteDeletedEvent) => {
  // eslint-disable-next-line no-console
  console.error('onStampPaletteDeleted: Not implemented')
}
