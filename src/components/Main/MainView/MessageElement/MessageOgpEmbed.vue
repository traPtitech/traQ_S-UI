<template>
  <div :class="$style.container" :style="containerStyle" @click="showContent">
    <iframe
      v-if="!previewUrl || isContentShown"
      :src="embeddedUrl"
      :class="$style.content"
      allowfullscreen
      allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
      referrerpolicy="no-referrer"
    />
    <template v-else>
      <img :src="previewUrl" :class="$style.image" />
      <div :class="$style.icon">
        <a-icon v-if="showPlayIcon" mdi name="play" :size="32" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import useToggle from '/@/composables/utils/useToggle'

const props = withDefaults(
  defineProps<{
    previewUrl?: string
    embeddedUrl: string
    showPlayIcon?: boolean
    aspectRatio?: number
  }>(),
  {
    showPlayIcon: false,
    aspectRatio: 9 / 16
  }
)

const { value: isContentShown, open: showContent } = useToggle()

const containerStyle = computed(() => ({
  paddingTop: `${props.aspectRatio * 100}%`
}))
</script>

<style lang="scss" module>
.container {
  // iframeを幅いっぱいに表示するためのハック
  position: relative;
  width: 100%;
  overflow: hidden;
}
.content {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border: none;
}
.image {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  object-fit: contain;
}
.icon {
  opacity: 0.7;
  .container:hover & {
    opacity: 1;
  }
  &::before {
    content: '';
    display: block;
    @include background-common-black;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
    border-radius: 100%;
  }
  @include color-common-text-white-primary;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
}
</style>
