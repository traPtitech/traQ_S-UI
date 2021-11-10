<template>
  <div :class="$style.container" :style="styles.container" @click="showContent">
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

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { makeStyles } from '/@/lib/styles'
import AIcon from '/@/components/UI/AIcon.vue'

const usePreviewState = () => {
  const isContentShown = ref(false)
  const showContent = () => {
    isContentShown.value = true
  }
  return { isContentShown, showContent }
}

const useStyles = (props: { aspectRatio: number }) =>
  reactive({
    container: makeStyles(() => ({
      paddingTop: `${props.aspectRatio * 100}%`
    }))
  })

export default defineComponent({
  name: 'MessageOgpEmbed',
  components: { AIcon },
  props: {
    previewUrl: {
      type: String,
      default: undefined
    },
    embeddedUrl: {
      type: String,
      required: true
    },
    showPlayIcon: {
      type: Boolean,
      default: false
    },
    aspectRatio: {
      type: Number,
      default: 9 / 16
    }
  },
  setup(props) {
    const { isContentShown, showContent } = usePreviewState()
    const styles = useStyles(props)
    return {
      isContentShown,
      showContent,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.container {
  // iframeを幅いっぱいに表示するためのハック
  position: relative;
  width: 100%;
  // padding-top: 56.25%;
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
