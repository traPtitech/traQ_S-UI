<template>
  <div
    :class="$style.volume"
    :data-keep-expanded="keepExpanded"
    :aria-disabled="disabled"
  >
    <div :class="$style.volumeSlider">
      <slider
        :value="roundedVolume"
        :disabled="disabled"
        tooltip="none"
        @change-value="changeVolume"
        @click.prevent
      />
    </div>
    <icon
      :class="$style.icon"
      mdi
      :size="20"
      :name="volume > 0 ? 'volume-high' : 'volume-off'"
      @click.prevent="changeVolume(volume > 0 ? 0 : 100)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import Slider from '/@/components/UI/Slider.vue'

export default defineComponent({
  name: 'AudioPlayerVolumeSlider',
  components: {
    Icon,
    Slider
  },
  props: {
    volume: {
      type: Number,
      required: true
    },
    keepExpanded: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    'update:volume': (_val: number) => true
  },
  setup(props, { emit }) {
    const roundedVolume = computed(() => Math.floor(props.volume * 100))

    const changeVolume = (vol: number) => {
      emit('update:volume', vol)
    }
    return {
      roundedVolume,
      changeVolume
    }
  }
})
</script>

<style lang="scss" module>
$afterVolumeSliderWidth: 48px;

.volume {
  display: flex;
  align-items: center;
  border-radius: 40px;
  &:not([aria-disabled='true']):hover {
    background: rgba(32, 33, 36, 0.06);
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
  }

  :global {
    $dotBgColor: #1e1e1e;

    $bgColor: #b7b9ba;
    $themeColor: #585859;

    @import '/~/vue-slider-component/lib/theme/default.scss';
  }
}
.volumeSlider {
  transition: width ease 0.3s, margin ease 0.3s, opacity ease 0.25s;
  width: 0;
  opacity: 0;
  margin: auto 0;
  .volume[data-keep-expanded='true'] &,
  .volume:hover & {
    transition: width ease 0.3s, margin ease 0.3s, opacity ease 0.25s;
    width: $afterVolumeSliderWidth;
    opacity: 1;
    margin: auto 8px;
  }

  :global(.vue-slider-dot-handle) {
    opacity: 1;
    transition: opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  &:not(:hover) :global(.vue-slider-dot-handle) {
    opacity: 0;
  }
}
.icon {
  flex-shrink: 0;
}
</style>
