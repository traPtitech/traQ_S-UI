<template>
  <div :class="$style.container">
    <filter-input
      :on-secondary="true"
      :text="props.text"
      @input="props.atInput"
      :class="$style.input"
    />
    <div :class="$style.hash" :style="styles.hash">
      <icon
        @click="props.atClick"
        name="star"
        :width="24"
        :height="24"
        :mdi="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import FilterInput from '@/components/UI/FilterInput.vue'
import Icon from '@/components/UI/Icon.vue'
import { makeStyles } from '../../../../lib/styles'

const useOpenedParentContainerStyle = (selected: boolean) =>
  makeStyles(theme => ({
    background: selected ? theme.accent.primary : theme.ui.primary,
    color: theme.background.secondary
  }))

const useClosedParentContainerStyle = (selected: boolean) =>
  makeStyles(theme => ({
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: selected ? theme.accent.primary : theme.ui.primary,
    color: selected ? theme.accent.primary : theme.ui.primary
  }))

const useStyles = (props: { isStared: Boolean }) =>
  reactive({
    container: makeStyles(theme => ({}))
  })

export default defineComponent({
  name: 'ChannelFilter',
  components: {
    FilterInput,

    Icon
  },
  props: {
    atInput: {
      type: Function,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    atClick: {
      type: Function,
      required: true
    },
    isStared: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const styles = reactive({
      hash: computed(() =>
        props.isStared
          ? useOpenedParentContainerStyle(props.isStared).value
          : useClosedParentContainerStyle(props.isStared).value
      )
    })
    return {
      props,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.element {
  cursor: pointer;
}
.list {
  margin: 16px 0px;
}
.input {
  margin-bottom: 16px;
}
.container {
  display: flex;
}
.hash {
  border: solid 2px transparent;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  box-sizing: content-box;
}
</style>
