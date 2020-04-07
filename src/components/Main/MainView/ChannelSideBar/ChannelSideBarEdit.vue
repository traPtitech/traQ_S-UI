<template>
  <div :class="$style.container" :style="styles.container" @click="onClick">
    <Icon
      v-if="state.isEditing"
      mdi
      name="toggle-switch-on"
      height="20"
      width="20"
    />
    <Icon v-else mdi name="toggle-switch-off" height="20" width="20" />
    <div>編集</div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'

type State = {
  isEditing: boolean
}

const useStyles = (state: State) =>
  reactive({
    container: makeStyles(theme => ({
      color: state.isEditing ? theme.ui.primary : theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarEdit',
  props: { channelId: String },
  components: { Icon },
  setup() {
    const state: State = reactive({
      isEditing: false
    })
    const onClick = () => {
      state.isEditing = !state.isEditing
    }
    const styles = useStyles(state)
    return { state, styles, onClick }
  }
})
</script>

<style lang="scss" module>
$editButtonText: 0.8rem;

.container {
  display: flex;
  margin-top: 56px;
  align-items: center;
  font-size: $editButtonText;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}
</style>
