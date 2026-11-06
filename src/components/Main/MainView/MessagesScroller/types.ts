import type MessagesScroller from './MessagesScroller.vue'

export type MessageScrollerInstance = Omit<
  InstanceType<typeof MessagesScroller>,
  '$el'
> & {
  $el: HTMLDivElement
}
