<template>
  <div :class="$style.add">
    <input
      type="text"
      :class="$style.input"
      :style="styles.input"
      v-model="newTagName"
      placeholder="タグを追加"
      minlength="1"
      maxlength="30"
    />
    <button
      :class="$style.button"
      :style="styles.button"
      @click="addTag"
      :disabled="newTagName.length === 0 || adding"
    >
      <icon name="plus" mdi :class="$style.icon" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import apis from '@/lib/api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    input: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.secondary,
      '--placeholder-color': theme.ui.secondary
    })),
    button: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.secondary
    }))
  })

type Props = {
  userId: UserId
}

export default defineComponent({
  name: 'TagsTab',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()

    const newTagName = ref('')
    const adding = ref(false)

    const addTag = async () => {
      adding.value = true
      await apis.addUserTag(props.userId, {
        tag: newTagName.value
      })
      adding.value = false
      newTagName.value = ''
    }

    return { styles, newTagName, addTag, adding }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.add {
  display: flex;
  flex-direction: row;
  margin: 8px;
}

.input {
  flex: 1 1;
  padding: 4px;
  padding-left: 16px;
  border-radius: 6px;
  &::placeholder {
    color: var(--placeholder-color);
  }
}

.button {
  padding: 0 12px;
  margin-left: 8px;
  border-radius: 6px;
  cursor: pointer;
}

.icon {
  vertical-align: middle;
}
</style>
