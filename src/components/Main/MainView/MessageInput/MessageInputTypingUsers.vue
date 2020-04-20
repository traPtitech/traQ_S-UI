<template>
  <div v-if="users.length > 0" :class="$style.container">
    <div :class="$style.text" :style="styles.text">
      {{ text }}
    </div>
    <user-icon
      v-for="userId in users"
      :key="userId"
      :class="$style.icon"
      :user-id="userId"
      :size="24"
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
import UserIcon from '@/components/UI/UserIcon.vue'

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

    const users = computed(() => props.typingUsers.reverse().slice(0, 3))
    const text = computed(
      () =>
        `${props.typingUsers.length > 3 ? 'and others' : ''} ${
          props.typingUsers.length === 1 ? 'is' : 'are'
        } typing`
    )

    return { styles, users, text }
  },
  components: {
    UserIcon
  }
})
</script>

<style lang="scss" module>
$overlap: 8px;

.container {
  position: absolute;
  top: -4px;
  left: 0;
  transform: translateY(-100%);
  display: flex;
  flex-direction: row-reverse;
  margin-left: $overlap;
}

.text {
  margin-left: 4px;
}

.icon {
  margin-left: -$overlap;
  border: solid 1px white;
}
</style>
