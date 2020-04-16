<template>
  <div :class="$style.body">
    <stamp-element
      :class="$style.element"
      v-for="(stamps, stampId) in state.stampsById"
      :key="stampId"
      :stamp-id="stampId"
      :stamps="stamps"
      @add-stamp="addStamp"
      @remove-stamp="removeStamp"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { MessageStamp } from '@traptitech/traq'
import StampElement from './StampElement.vue'
import { reduceToRecordOfArray } from '@/lib/util/record'
import { StampId, MessageId } from '@/types/entity-ids'
import store from '@/store'

export default defineComponent({
  name: 'MessageStampList',
  props: {
    stamps: {
      type: Array as PropType<MessageStamp[]>,
      required: true
    },
    messageId: {
      type: String,
      required: true
    }
  },
  components: { StampElement },
  setup(props) {
    const state = reactive({
      stampsById: computed(() => reduceToRecordOfArray(props.stamps, 'stampId'))
    })
    const addStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.addStamp({
        messageId: props.messageId,
        stampId
      })
    }
    const removeStamp = (stampId: StampId) => {
      store.dispatch.domain.messagesView.removeStamp({
        messageId: props.messageId,
        stampId
      })
    }

    return { props, state, addStamp, removeStamp }
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
