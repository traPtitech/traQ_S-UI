<template>
  <div :class="$style.body" :style="styles.body">
    <div :class="$style.stampContainer">
      <img :src="state.src" :alt="state.stamp.name" />
    </div>
    <div :class="$style.count" :style="styles.count">
      {{ state.count }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import { StampId } from '@/types/entity-ids'
import store from '@/store'
import { BASE_PATH, Stamp, MessageStamp } from '@/lib/api'
import { makeStyles } from '../../../../lib/styles'

type Props = {
  stampId: StampId
  stamps: MessageStamp[]
}

export default defineComponent({
  name: 'StampElement',
  props: {
    stampId: {
      type: String,
      required: true
    },
    stamps: {
      type: Array,
      required: true
    }
  },
  setup(props: Props) {
    const stamp = computed(() => store.state.entities.stamps[props.stampId])
    const state = reactive({
      count: computed(() =>
        props.stamps.reduce((acc, cur) => {
          return acc + cur.count
        }, 0)
      ),
      stamp,
      src: computed(() => `${BASE_PATH}/files/${stamp.value.fileId}`)
    })
    const styles = reactive({
      body: makeStyles(theme => {
        return {
          backgroundColor: theme.background.tertiary
        }
      }),
      count: makeStyles(theme => {
        return {
          color: theme.ui.primary
        }
      })
    })

    return {
      props,
      state,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.body {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
}

.stampContainer {
  width: 20px;
  height: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
  }
}

.count {
  font-size: 0.8rem;
  min-width: 1.1rem;
  font-weight: bold;
  padding: {
    left: 6px;
    right: 4px;
  }
  opacity: 0.6;

  .body:hover & {
    opacity: 1;
  }
}
</style>
