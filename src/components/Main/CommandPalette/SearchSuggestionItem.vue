<template>
  <div :class="$style.container" @click="onClick">
    <user-icon
      v-if="item.type === 'user'"
      :class="$style.icon"
      :user-id="item.value"
      :size="20"
    />
    <a-icon v-else :class="$style.icon" :mdi="icon.mdi" :name="icon.name" />
    <span :class="$style.title">{{ title }}</span>
    <span :class="$style.description">{{ description }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ChannelId, UserId } from '/@/types/entity-ids'
import { computed } from 'vue'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'
import AIcon from '/@/components/UI/AIcon.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'

export type SuggestionItem =
  | { type: 'search'; value: string }
  | { type: 'channel'; value: ChannelId }
  | { type: 'user'; value: UserId }

const props = defineProps<{
  item: SuggestionItem
}>()

const emit = defineEmits<{
  (e: 'select', _item: SuggestionItem): void
}>()

const { channelsMap } = useChannelsStore()
const { usersMap } = useUsersStore()

const title = computed(() => {
  switch (props.item.type) {
    case 'search':
      return props.item.value
    case 'channel':
      return channelsMap.value.get(props.item.value)?.name ?? ''
    case 'user':
      return usersMap.value.get(props.item.value)?.name ?? ''
  }
  return ''
})
const description = computed(() => {
  switch (props.item.type) {
    case 'search':
      return 'Enterで検索'
    case 'channel':
      return channelsMap.value.get(props.item.value)?.topic ?? ''
    case 'user':
      return usersMap.value.get(props.item.value)?.displayName ?? ''
  }
  return ''
})
const icon = computed(() => {
  switch (props.item.type) {
    case 'search':
      return { name: 'search', mdi: true }
    case 'channel':
      return { name: 'hash', mdi: false }
    case 'user':
      return { name: 'user', mdi: false }
  }
  return { name: '', mdi: false }
})
const onClick = () => {
  emit('select', props.item)
}
</script>

<style lang="scss" module>
.container {
  width: 100%;
  padding: 0.5rem 0 0.5rem 1rem;
  display: grid;
  grid-template-columns: min-content auto min-content 1fr;
  grid-gap: 1rem;
  align-items: center;
  user-select: none;
  cursor: pointer;
  &:hover {
    @include background-secondary;
  }
}
.icon {
  margin: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
}
.title {
  @include size-body1;
  @include color-ui-primary;
  word-break: break-all;
}
.description {
  @include size-body2;
  @include color-ui-secondary;
  word-break: keep-all;
}
</style>
