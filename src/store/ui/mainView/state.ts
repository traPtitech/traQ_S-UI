import { ChannelId } from '@/types/entity-ids'

export type ViewType = 'messages' | 'qall'
export interface ViewInformationBase {
  type: ViewType
}
export type ViewInformation = MessagesView | QallView

export type LayoutType = 'single' | 'split'

export interface MessagesView extends ViewInformationBase {
  type: 'messages'
}

export interface QallView extends ViewInformationBase {
  type: 'qall'
}

export interface S {
  layout: LayoutType
  primaryView: ViewInformation
  secondaryView?: ViewInformation
}

export const state: S = {
  layout: 'single',
  primaryView: {
    type: 'messages'
  },
  secondaryView: {
    type: 'qall'
  }
}
