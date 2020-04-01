<template>
  <div :class="$style.body">
    <stamp-element
      :class="$style.element"
      v-for="(stamps, stampId) in state.stampsById"
      :key="stampId"
      :stamp-id="stampId"
      :stamps="stamps"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { MessageStamp } from '@traptitech/traq'
import StampElement from './StampElement.vue'
import { reduceToRecordOfArray } from '@/lib/util/record'

type Props = {
  stamps: MessageStamp[]
}

export default defineComponent({
  name: 'MessageStampList',
  props: {
    stamps: {
      type: Array,
      required: true
    }
  },
  components: { StampElement },
  setup(props: Props) {
    const state = reactive({
      stampsById: computed(() => reduceToRecordOfArray(props.stamps, 'stampId'))
    })
    return { props, state }
  }
})
</script>

<style lang="scss" module>
.body {
  display: inline-flex;
  flex-wrap: wrap;

  & > .element {
    margin: {
      right: 4px;
      bottom: 4px;
    }
  }
}
</style>
