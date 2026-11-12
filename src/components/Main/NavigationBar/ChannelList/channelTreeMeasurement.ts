export const measureChannelTreeHeight = (
  element: Element,
  entry?: ResizeObserverEntry
) =>
  entry?.borderBoxSize?.[0]?.blockSize ??
  element.getBoundingClientRect().height / (element.currentCSSZoom ?? 1)
