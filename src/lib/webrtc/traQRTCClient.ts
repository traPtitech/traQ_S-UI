import Peer, { SfuRoom, RoomData } from 'skyway-js'
import apis from '@/lib/apis'

const skywayApiKey = '2a4e923e-2e16-4d3c-9a39-607c3f605f0a'

interface QRTCStreamChangeEvent extends Event {
  detail: {
    stream: MediaStream & { peerId: string }
  }
}
interface QRTCDataRecieveEvent extends Event {
  detail: {
    data: RoomData
  }
}
interface QRTCUserJoinEvent extends Event {
  detail: {
    userId: string
  }
}
interface QRTCUserLeaveEvent extends Event {
  detail: {
    userId: string
  }
}
interface QRTCConnectionErrorEvent extends Event {
  detail: {
    err: any
  }
}

interface QRTCEventMap {
  connect: Event
  connectionclose: Event
  disconnect: Event
  roomopen: Event
  roomclose: Event
  userjoin: QRTCUserJoinEvent
  userleave: QRTCUserLeaveEvent
  streamchange: QRTCStreamChangeEvent
  datarecieve: QRTCDataRecieveEvent
  connectionerror: QRTCConnectionErrorEvent
}

class traQRTCClientBase {
  private eventTargetDeligator: EventTarget = document.createDocumentFragment()

  public addEventListener<K extends keyof QRTCEventMap>(
    event: K,
    listener: (ev: QRTCEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ) {
    return this.eventTargetDeligator.addEventListener(
      event,
      listener as EventListener,
      options
    )
  }

  public removeEventListener<K extends keyof QRTCEventMap>(
    event: K,
    listener: (ev: QRTCEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ) {
    return this.eventTargetDeligator.removeEventListener(
      event,
      listener as EventListener,
      options
    )
  }

  public dispatchEvent<K extends keyof QRTCEventMap>(event: QRTCEventMap[K]) {
    return this.eventTargetDeligator.dispatchEvent(event)
  }
}

/**
 * @class リアルタイム系機能を提供するクラス
 */
class traQRTCClient extends traQRTCClientBase {
  private peer?: Peer
  private room?: SfuRoom

  constructor(private id: string) {
    super()
  }

  /**
   * @returns a Promise instance to be resolved when a connection has been established.
   */
  public async establishConnection() {
    try {
      this.peer = await this.createPeer(this.id)
    } catch (e) {
      this.handlePeerError(e)
    }
    if (!this.peer) {
      this.handlePeerError('poyo')
      return
    }

    this.dispatchEvent(new Event('connect'))

    this.peer.on('close', this.handlePeerClose.bind(this))
    this.peer.on('disnonected', this.handlePeerDisconnected.bind(this))
    this.peer.on('error', this.handlePeerError.bind(this))

    // this.id = this.peer.id
    return this.id
  }

  public closeConnection() {
    if (this.peer) {
      this.peer.destroy()
      // eslint-disable-next-line no-console
      console.log('[RTC] Connection closed')
    }
  }

  /**
   * Join to the room.
   * @param roomName a name of room to join.
   */
  public joinRoom(roomName: string, stream: MediaStream) {
    return new Promise(async (resolve, reject) => {
      if (!this.peer || !this.peer.open) {
        reject('connection has not been established')
        return
      }
      const room = this.peer.joinRoom(roomName, {
        mode: 'sfu',
        stream
      }) as SfuRoom
      if (!room) {
        reject(`failed to join room: ${roomName}.`)
        return
      }
      room.on('open', this.handleRoomOpen.bind(this))
      room.on('peerJoin', this.handleRoomPeerJoin.bind(this))
      room.on('peerLeave', this.handleRoomPeerLeave.bind(this))
      room.on('stream', this.handleRoomStream.bind(this))
      room.on('data', this.handleRoomData.bind(this))
      room.on('close', this.handleRoomClose.bind(this))
      this.room = room
      resolve()
    })
  }

  public async setStream(stream: MediaStream) {
    if (!this.peer) {
      throw 'Connection is not established'
    }
    if (!this.room) {
      throw 'Not joined to any room'
    }
    this.room.replaceStream(stream)
  }

  get roomName() {
    return this.room ? this.room.name : ''
  }

  private createPeer(peerId: string) {
    return new Promise<Peer>(async (resolve, reject) => {
      const res = await apis.postWebRTCAuthenticate({ peerId })
      if (res.status !== 200) {
        reject("Couldn't get credential")
        return
      }
      const peer = new Peer(peerId, {
        key: skywayApiKey,
        credential: res.data
      })
      if (!peer) {
        reject("Couldn't establish connection")
        return
      }
      peer.on('open', () => {
        // eslint-disable-next-line no-console
        console.log(`[RTC] Connection established, ID: ${peer.id}`)
        resolve(peer)
      })
    })
  }

  private handlePeerClose() {
    this.dispatchEvent(new Event('connectionclose'))
  }
  private handlePeerDisconnected() {
    this.dispatchEvent(new Event('disconnect'))
  }
  private handlePeerError(err: any) {
    // eslint-disable-next-line no-console
    console.error(`[RTC] ${err}`)
    this.dispatchEvent(new CustomEvent('connectionerror', { detail: { err } }))
  }
  private async handleRoomOpen() {
    // eslint-disable-next-line no-console
    console.log(`[RTC] Room opened, name: ${this.roomName}`)
    this.dispatchEvent(new Event('roomopen'))
  }
  private async handleRoomClose() {
    this.dispatchEvent(new Event('roomclose'))
  }
  private async handleRoomPeerJoin(peerId: string) {
    this.dispatchEvent(
      new CustomEvent('userjoin', { detail: { userId: peerId } })
    )
  }
  private async handleRoomPeerLeave(peerId: string) {
    this.dispatchEvent(
      new CustomEvent('userleave', { detail: { userId: peerId } })
    )
  }
  private async handleRoomStream(stream: MediaStream & { peerId: string }) {
    this.dispatchEvent(new CustomEvent('streamchange', { detail: { stream } }))
  }
  private async handleRoomData(data: RoomData) {
    this.dispatchEvent(new CustomEvent('datarecieve', { detail: { data } }))
  }
}

export let client: traQRTCClient | undefined = undefined

export const initClient = (id: string) => {
  if (!client) {
    client = new traQRTCClient(id)
  }
}

export const destroyClient = () => {
  client = undefined
}
