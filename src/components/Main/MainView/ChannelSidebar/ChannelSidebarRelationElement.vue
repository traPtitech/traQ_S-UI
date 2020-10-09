<template>
  <div>
    <div :class="$style.channelNameContainer" :data-is-current="isCurrent">
      <span :data-is-current="$boolAttr(isCurrent)" :class="$style.channelHash">
        #
      </span>
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
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ChannelSidebarRelationElement',
  props: {
    name: { type: String, required: true },
    topic: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    link: { type: String }
  }
})
</script>

<style lang="scss" module>
.channelNameContainer {
  &[data-is-current] {
    @include color-accent-primary;
  }
  @include size-h3;
}

.channelHash {
  margin-right: 0.125rem;
  user-select: none;
}

.topic {
  @include size-body2;
  font-weight: normal;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
