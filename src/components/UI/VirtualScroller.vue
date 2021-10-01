<template>
  <div ref="rootRef" :class="$style.root" @scroll.passive="handleScroll">
    <div :class="$style.viewport" :style="styles.viewportStyle">
      <div ref="spacerRef" :class="$style.spacer" :style="styles.spacerStyle">
        <div
          v-for="(item, index) in data.visibleItems"
          :key="item[key]"
          :ref="item[key]"
          :data-index="index"
        >
          <slot :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  PropType
} from 'vue'
import { throttle } from 'throttle-debounce'

const binarySearch = (arr: number[], x: number) => {
  let low = 0
  let high = Array.isArray(arr) ? arr.length - 1 : Object.keys(arr).length - 1
  let mid
  while (low < high) {
    mid = Math.floor((high + low) / 2)
    if (arr[mid] === x) {
      break
    } else if (arr[mid] > x) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }
  mid = Math.floor((high + low) / 2)
  if (x <= arr[mid]) return mid
  else return mid + 1
}

// 見える最初のアイテムを二分探索
const findStartNode = (
  scrollTop: number,
  nodePositions: number[],
  itemCount: number
) => {
  let startRange = 0
  let endRange = itemCount - 1
  while (endRange !== startRange) {
    const middle = Math.floor((endRange - startRange) / 2 + startRange)
    if (
      nodePositions[middle] <= scrollTop &&
      nodePositions[middle + 1] > scrollTop
    ) {
      return middle
    }
    if (middle === startRange) {
      // edge case - start and end range are consecutive
      return endRange
    } else {
      if (nodePositions[middle] <= scrollTop) {
        startRange = middle
      } else {
        endRange = middle
      }
    }
  }
  return itemCount
}

const PAGE_SIZE = 50

export default defineComponent({
  name: 'VirtualScroller',
  props: {
    items: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: Array as PropType<any[]>,
      required: true
    },
    key: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const state = reactive({
      isMounted: false,
      isLoading: false,
      pageStartIndex: 0,
      startIndex: 0,
      endIndex: PAGE_SIZE,
      itemHeights: [] as number[],
      rollingPageHeights: [] as number[],
      smallestRowHeight: Number.MAX_SAFE_INTEGER,
      largestRowHeight: Number.MIN_SAFE_INTEGER,
      spacerShiftY: 0,
      scrollTop: 0,
      renderAhead: 10,
      selectedIndex: 0
    })

    const data = reactive({
      viewportHeight: computed(() =>
        !state.isMounted ? 1000 : state.rollingPageHeights.slice(-1).pop()
      ),
      rootHeight: computed(() =>
        !state.isMounted || !rootRef.value ? 0 : rootRef.value.offsetHeight
      ),
      rowPositions: computed(() => {
        const currentHeights = state.itemHeights.slice(
          state.pageStartIndex * PAGE_SIZE,
          (state.pageStartIndex + 1) * PAGE_SIZE
        )
        let totalDisplacement =
          state.rollingPageHeights[state.pageStartIndex - 1] || 0
        const displacements = []
        for (let i = 0; i < currentHeights.length; i++) {
          displacements.push(totalDisplacement)
          totalDisplacement += currentHeights[i]
        }
        displacements.push(totalDisplacement)

        return displacements
      }),
      visibleItems: computed(() =>
        props.items.slice(state.startIndex, state.endIndex)
      )
    })

    const styles = reactive({
      spacerStyle: computed(() => {
        return {
          transform: `translateY(${state.spacerShiftY || 0}px)`
        }
      }),
      viewportStyle: computed(() => {
        return {
          height: `${data.viewportHeight || 0}px`
        }
      })
    })

    const rootRef = ref<HTMLElement | null>(null)
    const spacerRef = ref<HTMLElement | null>(null)

    const handleScroll = throttle(17, (e: Event) => {
      if (!rootRef.value) return
      const el = rootRef.value
      state.scrollTop = el.scrollTop
      //TODO: load more
    })
    const scrollTo = (index: number) => {
      if (!rootRef.value) return
      const pageStartIndex = Math.floor(index / PAGE_SIZE)

      const currentHeights = state.itemHeights.slice(
        pageStartIndex * PAGE_SIZE,
        (pageStartIndex + 1) * PAGE_SIZE
      )
      let totalDisplacement = state.rollingPageHeights[pageStartIndex - 1] || 0
      const displacements = []
      for (let i = 0; i < currentHeights.length; i++) {
        displacements.push(totalDisplacement)
        totalDisplacement += currentHeights[i]
      }
      displacements.push(totalDisplacement)
      // console.log(pageStartIndex, rollingPageHeights[pageStartIndex], heights.slice(pageStartIndex * PAGE_SIZE, (pageStartIndex + 1) * PAGE_SIZE), displacements[index]);
      const top = displacements[index % PAGE_SIZE]
      const isVisible =
        top >= state.scrollTop &&
        top <= state.scrollTop + rootRef.value.offsetHeight
      if (!isVisible) {
        rootRef.value.scrollTo({
          left: 0,
          top: displacements[index % PAGE_SIZE],
          behavior: 'smooth'
        })
      }
    }
    const updatePageHeights = (pageIndices: number[]) => {
      for (let i = 0; i < pageIndices.length; i++) {
        const pageStartIndex = pageIndices[i]
        const startIndex = pageStartIndex * PAGE_SIZE
        const endIndex = (pageStartIndex + 1) * PAGE_SIZE
        const heightsSlice = state.itemHeights.slice(startIndex, endIndex)
        state.rollingPageHeights[pageStartIndex] =
          (state.rollingPageHeights[pageStartIndex - 1] || 0) +
          heightsSlice.reduce((a, b) => a + b)
      }
    }
    const update = () => {
      if (!spacerRef.value) return

      const children = spacerRef.value.children
      const pageIndices = new Set<number>()
      for (const child of children) {
        const { scrollHeight } = child
        const index = Number(child.getAttribute('data-index'))
        if (!index) continue
        state.itemHeights[index] = scrollHeight
        // Update the largest and smallest row heights
        state.largestRowHeight =
          scrollHeight > state.largestRowHeight
            ? scrollHeight
            : state.largestRowHeight
        state.smallestRowHeight =
          scrollHeight < state.smallestRowHeight
            ? scrollHeight
            : state.smallestRowHeight
        const pageIndex = Math.floor(index / PAGE_SIZE)
        pageIndices.add(pageIndex)
      }
      updatePageHeights([...pageIndices])
    }
    // TODO: fetch new messages
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const loadMore = () => {}

    onMounted(() => {
      state.isMounted = true
      nextTick(() => {
        update()
      })
      // const ro = new ResizeObserver(entries => {
      //   let index = 0
      //   let pageIndices = new Set()
      //   const runner = () => {
      //     if (index < this.items.length) {
      //       var newDiv = document.createElement('div')
      //       // newDiv.style.width = this.$el.clientWidth + "px";
      //       newDiv.classList.add('list-item')
      //       newDiv.innerHTML = this.items[index].value
      //       const height = getNodeHeight(newDiv, this.$el.clientWidth)
      //       this.largestRowHeight =
      //         height > this.largestRowHeight ? height : this.largestRowHeight
      //       this.smallestRowHeight =
      //         height < this.smallestRowHeight ? height : this.smallestRowHeight
      //       this.heights[index] = height
      //       const pageIndex = Math.floor(index / PAGE_SIZE)
      //       pageIndices.add(pageIndex)

      //       index++
      //       setTimeout(runner, 0)
      //     } else {
      //       pageIndices = Array.from(pageIndices)
      //       this.updatePageHeights(pageIndices)
      //     }
      //   }
      //   runner()
      // })
      // ro.observe(rootRef.value)
    })
    onUnmounted(() => {
      state.isMounted = false
    })

    const updateIndex = (scrollTop: number) => {
      state.pageStartIndex = binarySearch(state.rollingPageHeights, scrollTop)
      const startNodeIndex = findStartNode(
        scrollTop,
        data.rowPositions.slice(),
        data.rowPositions.length
      )
      state.startIndex = state.pageStartIndex * PAGE_SIZE + startNodeIndex
      state.endIndex =
        state.startIndex + Math.floor(data.rootHeight / state.smallestRowHeight)
      state.spacerShiftY = data.rowPositions[startNodeIndex]
    }

    watch(
      () => state.scrollTop,
      scrollTop => {
        updateIndex(scrollTop)
      }
    )
    watch(
      () => props.items,
      items => {
        state.isLoading = true
        state.endIndex =
          Math.floor(props.items.length / PAGE_SIZE) * PAGE_SIZE + PAGE_SIZE

        nextTick(() => {
          update()
          updateIndex(state.scrollTop)
          state.isLoading = false
        })
      }
    )

    return {
      rootRef,
      spacerRef,
      handleScroll,
      state,
      data,
      styles
    }
  }
})
</script>

<style lang="scss" module>
.root {
  height: 100%;
  overflow-y: scroll;
}

.viewport {
  overflow: hidden;
  position: relative;
}

.spacer {
  display: block;
}
</style>
