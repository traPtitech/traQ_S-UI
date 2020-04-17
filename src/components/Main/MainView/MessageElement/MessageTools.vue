<template>
  <div :class="$style.container" :style="styles.container">
    <stamp :stamp-id="stamp.id" :size="16" />
    <stamp :stamp-id="stamp.id" :size="16" />
    <stamp :stamp-id="stamp.id" :size="16" />
    <div :class="$style.emojiOutline">
      <icon
        mdi
        name="emoticon-outline"
        :size="16"
        :class="$style.emojiOutlineIcon"
      />
    </div>
    <icon :size="16" :class="$style.icon" mdi name="dots-horizontal" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import { buildFilePath } from '@/lib/api'
import Stamp from '@/components/UI/Stamp.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.tertiary
    }))
  })

export const targetPortalName = 'header-popup'

export default defineComponent({
  name: 'MessageTools',
  components: {
    Icon,
    Stamp
  },
  setup() {
    const styles = useStyles()
    const stamp = computed(
      () => store.state.entities.stamps['44f5ccb9-068a-47bb-9421-4f093e1a1c22']
    )
    return {
      styles,
      stamp
    }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 24px;
  width: 104px;
  border-radius: 4px;
  border: solid 2px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px 0;
  padding: 4px;
  justify-content: space-between;
}

.emojiOutline {
  border-left: solid 2px;
  padding-left: 4px;
  height: 16px;
  margin-left: 4px;
}

.emojiOutlineIcon {
  margin-bottom: 4px;
}
</style>
