<template>
  <div :class="$style.wrap">
    <div v-if="props.channels.length === 0" :class="$style.empty">
      {{ props.emptyMessage }}
    </div>

    <ul :class="$style.list">
      <li v-for="channel in displayedChannels" :key="channel.id">
        <channel-header-relation-list-item
          ref="listItemsRef"
          :channel="channel"
        />
      </li>
    </ul>
    <form-button
      v-if="showExpandButton"
      :class="$style.expandButton"
      color="secondary"
      label="全て表示"
      @click="expand"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Channel } from '@traptitech/traq'
import { computed, ref, type HTMLAttributes, nextTick } from 'vue'
import ChannelHeaderRelationListItem from './ChannelHeaderRelationListItem.vue'
import FormButton from '/@/components/UI/FormButton.vue'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  channels: Channel[]
  emptyMessage: string
}
const props = defineProps<Props>()

const listItemsRef = ref<InstanceType<typeof ChannelHeaderRelationListItem>[]>(
  []
)

const isExpanded = ref(false)
const expand = () => {
  isExpanded.value = true
  nextTick(() => {
    // NOTE: すべて表示で新たに表示されるチャンネルにフォーカスする
    //       ただし、listItemsRef の中身は表示順であることが保証されないため、find で探す
    listItemsRef.value
      .find(item => item.$props.channel.id === props.channels[3]?.id)
      ?.focus()
  })
}

const displayedChannels = computed(() => {
  if (isExpanded.value) {
    return props.channels
  } else {
    return props.channels.slice(0, 3)
  }
})
const showExpandButton = computed(
  () => props.channels.length > 3 && !isExpanded.value
)
</script>

<style lang="scss" module>
.wrap {
  overflow: auto;
  // NOTE: スクロール可能な際に、一番下がちょっと見えるような高さに設定
  max-height: 21.75rem;
  margin-bottom: -16px;
  padding-bottom: 16px;
}

.empty {
  @include color-ui-secondary;

  padding: 16px;
  place-items: center;
  text-align: center;
  font-size: 0.75rem;
}

.list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.expandButton {
  margin-top: 0.5rem;
  width: 100%;
}
</style>
