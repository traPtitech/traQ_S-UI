<template>
  <div :class="$style.container" :style="styles.container">
    <icon mdi name="bookmark" :class="$style.icon" />
    <h2 :class="$style.header">{{ name }}</h2>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { ClipFolderId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ClipsSidebarHeader',
  components: { Icon },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  setup(props) {
    const styles = useStyles()
    const name = computed(
      () => store.state.entities.clipFolders[props.clipFolderId]?.name ?? ''
    )
    return { styles, name }
  }
})
</script>

<style lang="scss" module>
$headerSize: 1.23rem;

.container {
  height: 100%;
  width: #{calc(100% - 32px)};
  display: flex;
  align-items: center;
}
.icon {
  margin-right: 16px;
  flex-shrink: 0;
}
.header {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: $headerSize;
}
</style>
