<template>
  <div @click="context.emit('click')" :class="$style.container">
    <img loading="lazy" :class="$style.image" :src="imageUrl" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  SetupContext
} from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import { makeStyles } from '@/lib/styles'
import { buildStampImagePath } from '@/lib/api'

type Props = {
  stampId: StampId
}

export default defineComponent({
  name: 'StampPickerStampListItem',
  props: {
    stampId: {
      type: String,
      required: true
    }
  },
  setup(props: Props, context: SetupContext) {
    const fileId = store.state.entities.stamps[props.stampId]?.fileId ?? ''
    const imageUrl = fileId ? `${buildStampImagePath(fileId)}` : ''
    return { props, context, imageUrl }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 32px;
  height: 32px;
  padding: 4px;
  cursor: pointer;
}
.image {
  width: 100%;
  height: 100%;
}
</style>
