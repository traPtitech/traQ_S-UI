import { ref } from 'vue'
import { Point } from '/@/lib/basic/point'

const useContextMenu = () => {
  const position = ref<Point>()

  const open = (newPosition: Point) => {
    position.value = newPosition
  }

  const close = () => {
    position.value = undefined
  }

  const toggle = (newPosition: Point) => {
    if (position.value === undefined) {
      open(newPosition)
    } else {
      close()
    }
  }

  return { position, open, close, toggle }
}

export default useContextMenu
