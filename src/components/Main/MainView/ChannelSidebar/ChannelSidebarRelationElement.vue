<template>
  <div>
    <div :class="$style.channelNameContainer" :data-is-current="isCurrent">
      <span :data-is-current="isCurrent" :class="$style.channelHash">#</span>
      <span>
        <router-link :to="isCurrent ? '' : link">{{ name }}</router-link>
      </span>
    </div>
    <div v-if="topic" :class="$style.topic">
      {{ topic }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'ChannelSidebarRelationElement',
  props: {
    name: { type: String, required: true },
    topic: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    link: { type: String }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
$channelNameSize: 1.125rem;
$topiclSize: 0.875rem;

.channelNameContainer {
  font-size: $channelNameSize;
  &[data-is-current] {
    @include color-accent-primary;
  }
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}

.topic {
  font-weight: normal;
  font-size: $topiclSize;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
