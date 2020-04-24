<template>
  <div :class="$style.body">
    <icon
      name="rounded-triangle"
      :size="24"
      @click="onStampDetailFoldingToggle"
      :class="$style.toggle"
      :style="styles.toggle"
    />
    <div :class="$style.stampList" :style="styles.stampList">
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
          v-if="stampDetailFoldingState"
          :class="$style.detail"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType,
  toRefs,
  Ref
} from '@vue/composition-api'
import { MessageStamp } from '@traptitech/traq'
import StampElement from './StampElement.vue'
import { reduceToRecordOfArray } from '@/lib/util/record'
import { StampId } from '@/types/entity-ids'
import store from '@/store'
import StampDetailElement from './StampDetailElement.vue'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '@/lib/styles'

const useStampDetailFolding = () => {
  const state = reactive({
    stampDetailFoldingState: false
  })
  const onStampDetailFoldingToggle = () => {
    state.stampDetailFoldingState = !state.stampDetailFoldingState
  }
  return {
    ...toRefs(state),
    onStampDetailFoldingToggle
  }
}

const useStyles = (stampDetailFoldingState: Ref<boolean>) =>
  reactive({
    toggle: makeStyles(theme => ({
      color: theme.ui.secondary,
      transform: stampDetailFoldingState.value
        ? `rotate(0.5turn)`
        : `rotate(0turn)`
    })),
    stampList: makeStyles(theme => ({
      flexDirection: stampDetailFoldingState.value ? `column` : `row`
    }))
  })

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
    const {
      stampDetailFoldingState,
      onStampDetailFoldingToggle
    } = useStampDetailFolding()
    const styles = useStyles(stampDetailFoldingState)
    return {
      props,
      state,
      addStamp,
      removeStamp,
      stampDetailFoldingState,
      onStampDetailFoldingToggle,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.body {
  display: inline-flex;
  flex-wrap: wrap;
}
.toggle {
  margin-right: 4px;
}
.stampList {
  display: flex;
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
