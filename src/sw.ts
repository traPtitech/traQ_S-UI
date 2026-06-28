import { setupNotification } from '/@/sw/notification'
import { setupWorkbox } from '/@/sw/workbox'

setupWorkbox()
setupNotification()

// TODO: メッセージのキャッシュのDB
