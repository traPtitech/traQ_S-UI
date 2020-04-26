<template>
  <div v-if="typingUsers.length > 0" :class="$style.container">
    <div :class="$style.text" :style="styles.text">
      {{ text }}
    </div>
    <user-icon-ellipsis-list
      direction="row"
      :show-count="false"
      :user-ids="typingUsers"
      :border-width="1"
      :icon-size="24"
      :overlap="8"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import UserIconEllipsisList from '@/components/UI/UserIconEllipsisList.vue'

const useStyles = () =>
  reactive({
    text: makeStyles(theme => ({
      color: theme.text.secondary
    }))
  })

export default defineComponent({
  name: 'MessageInputTypingUsers',
  props: {
    typingUsers: {
      type: Array as PropType<UserId[]>,
      required: true
    }
  },
  setup(props) {
    const styles = useStyles()

    const text = computed(
      () =>
        `${props.typingUsers.length > 3 ? 'and others' : ''} ${
          props.typingUsers.length === 1 ? 'is' : 'are'
        } typing`
    )

    return { styles, text }
  },
  components: {
    UserIconEllipsisList
  }
})
</script>

<style lang="scss" module>
.container {
  position: absolute;
  top: -4px;
  left: 0;
  transform: translateY(-100%);
  display: flex;
  flex-direction: row-reverse;
}

.text {
  margin-left: 4px;
}
</style>
