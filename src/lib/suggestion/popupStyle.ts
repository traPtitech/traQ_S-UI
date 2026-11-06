export const suggestionPopupStyle = (
  position: { top: number; left: number },
  width: number
) => ({
  top: `${position.top}px`,
  left: `max(8px, min(${position.left}px, calc(100vw - ${width + 8}px)))`,
  width: `min(${width}px, calc(100vw - 16px))`
})
