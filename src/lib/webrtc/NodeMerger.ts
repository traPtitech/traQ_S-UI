/**
 * m個のnodeのn個チャンネルを、一つのnodeのn個のチャンネルとして混ぜる
 *
 * ChannelMergerNodeは、一つのnodeのm*n個のチャンネルとして混ぜるので、
 * 挙動が異なる
 */
export default class NodeMerger {
  private readonly internalDestination: MediaStreamAudioDestinationNode
  private readonly internalSource: MediaStreamAudioSourceNode

  constructor(context: AudioContext) {
    this.internalDestination = context.createMediaStreamDestination()
    this.internalSource = context.createMediaStreamSource(
      this.internalDestination.stream
    )
  }

  addInput(node: AudioNode) {
    node.connect(this.internalDestination)
  }

  addOutput(node: AudioNode) {
    this.internalSource.connect(node)
  }

  reset() {
    this.internalDestination.disconnect()
    this.internalSource.disconnect()
  }
}
