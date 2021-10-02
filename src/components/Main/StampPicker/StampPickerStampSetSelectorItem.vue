<template>
  <div :class="$style.container" :aria-selected="isActive" @click="onClick">
    <div v-if="isActive" :class="$style.indicator"></div>
    <stamp
      v-if="stampSet.type === 'palette'"
      :stamp-id="pickThumbnail(stampSet.id)"
      :size="24"
      :class="$style.paletteStamp"
    />
    <icon
      v-else-if="stampSet.type === 'category'"
      :name="`stampCategory/${stampSet.id}`"
      :size="24"
      :class="$style.icon"
    />
    <icon
      v-else-if="stampSet.type === 'history'"
      mdi
      name="history"
      :size="24"
      :class="$style.icon"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import store from '/@/store'
import { StampPaletteId } from '/@/types/entity-ids'
import Icon from '/@/components/UI/Icon.vue'
import Stamp from '/@/components/UI/Stamp.vue'
import { StampSet } from './use/stampSetSelector'

const useStampPaletteThumbnail = () => {
  const pickThumbnail = (paletteId: StampPaletteId) => {
    const palette = store.state.entities.stampPalettesMap.get(paletteId)
    if (!palette) return ''
    if ((palette.stamps?.length ?? 0) > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return palette.stamps[0]!
    }
    return ''
  }
  return { pickThumbnail }
}

export default defineComponent({
  name: 'StampPickerStampSetSelectorItem',
  components: {
    Icon,
    Stamp
  },
  props: {
    stampSet: {
      type: Object as PropType<StampSet>,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    click: () => true
  },
  setup(props, { emit }) {
    const { pickThumbnail } = useStampPaletteThumbnail()
    const onClick = () => {
      emit('click')
    }
    return { pickThumbnail, onClick }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  height: 36px;
  cursor: pointer;
  &[aria-selected='true'] {
    @include color-accent-primary;
  }
}
.indicator {
  @include background-accent-primary;
  position: absolute;
  width: 32px;
  height: 2px;
  bottom: 0;
  left: -4px;
}
.paletteStamp {
  .container:not([aria-selected='true']) & {
    filter: grayscale(1);
  }
}
.icon {
  opacity: 0.5;
  .container[aria-selected='true'] & {
    opacity: 1;
  }
}
</style>
