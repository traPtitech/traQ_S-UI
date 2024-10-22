<template>
  <div>
    <div
      :class="$style.channelNameContainer"
      :data-is-current="$boolAttr(isCurrent)"
    >
      <router-link :to="isCurrent ? '' : link">
        <span :class="$style.channelHash"> # </span>
        <span>
          {{ name }}
        </span>
      </router-link>
    </div>
    <div v-if="topic" :class="$style.topic">
      <inline-markdown
        :class="$style.topic"
        :content="topic"
        :title="topic"
        accept-action
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

withDefaults(
  defineProps<{
    name: string
    topic?: string
    isCurrent?: boolean
    link: string
  }>(),
  {
    topic: '',
    isCurrent: false
  }
)
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
