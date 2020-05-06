<template>
  <div :class="$style.stampList" :data-show-details="isShowDetail">
    <div
      v-for="(stamps, stampId) in state.stampsById"
      :key="stampId"
      :class="$style.stamp"
    >
      <stamp-element
        :class="$style.element"
        :stamp-id="stampId"
        :stamps="stamps"
        @add-stamp="addStamp"
        @remove-stamp="removeStamp"
      />
      <stamp-detail-element
        :stamp-id="stampId"
        :stamps="stamps"
        v-if="props.isShowDetail"
        :class="$style.detail"
      />
    </div>
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
import { StampId } from '@/types/entity-ids'
import store from '@/store'
import StampDetailElement from './StampDetailElement.vue'
import Icon from '@/components/UI/Icon.vue'

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
    },
    isShowDetail: {
      type: Boolean,
      required: true
    }
  },
  components: { StampElement, StampDetailElement, Icon },
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
    return {
      props,
      state,
      addStamp,
      removeStamp
    }
  }
})
</script>

<style lang="scss" module>
.toggle {
  margin-right: 4px;
}
.stampList {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  &[data-show-details] {
    flex-direction: column;
  }
  contain: content;
}
.stamp {
  margin: {
    right: 4px;
    bottom: 4px;
  }

  display: flex;
}
.detail {
  margin-left: 4px;
}
</style>
