<template>
  <div :class="$style.container">
    <router-link
      v-if="ancestorsPath[0]"
      :to="ancestorsPath[0].link"
      :class="$style.ancestorHash"
    >
      #
    </router-link>
    <span v-else :class="$style.currentHash">#</span>
    <span v-for="(ancestor, i) in ancestorsPath" :key="i">
      <router-link :to="ancestor.link" :class="$style.ancestor">{{
        isMobile ? ancestor.name[0] : ancestor.name
      }}</router-link>
      <span
        :class="$style.ancestorSeparator"
        :data-is-primary="$boolAttr(pathInfoList.length <= 1)"
        >/</span
      >
    </span>
    <span :class="$style.current">{{ currentChannelLastPath }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import useChannelPath from '/@/composables/useChannelPath'
import { constructChannelPath } from '/@/router'
import { useResponsiveStore } from '/@/store/ui/responsive'

const props = defineProps<{
  channelId: ChannelId
}>()

const { isMobile } = useResponsiveStore()

const { channelIdToPath } = useChannelPath()

type ChannelPathInfo = {
  name: string
  link: string
}
/** 現在のチャンネルに至るまでのフルパスたち */
const pathInfoList = computed((): ChannelPathInfo[] =>
  channelIdToPath(props.channelId).map((p, i, arr) => {
    const path = arr.slice(0, i + 1)
    return {
      name: p,
      link: constructChannelPath(path.join('/'))
    }
  })
)

const ancestorsPath = computed(() => pathInfoList.value.slice(0, -1))
const currentChannelLastPath = computed(
  () => pathInfoList.value[pathInfoList.value.length - 1]?.name ?? ''
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  height: 100%;
  word-break: keep-all;
  white-space: nowrap;
}
.ancestor {
  @include color-ui-secondary-inactive;
  @include size-body1;
  cursor: pointer;
  &:hover {
    @include color-ui-secondary;
  }
}
.ancestorSeparator {
  @include color-ui-secondary-inactive;
  &[data-is-primary] {
    @include color-ui-primary-inactive;
  }
  @include size-body1;
  margin: 0 0.125rem;
  user-select: none;
}
.current {
  @include size-h1;
  margin: 0 0.125rem;
}
.currentHash {
  @include size-h1;
  user-select: none;
  margin-right: 0.125rem;
}
.ancestorHash {
  @include color-ui-primary-inactive;
  @include size-h1;
  margin-right: 0.125rem;
  user-select: none;
  &:hover {
    @include color-ui-primary;
  }
}
</style>
