import { setupWorkbox } from '@/sw/workbox'
import { setupNotification } from '@/sw/notification'

setupWorkbox()
setupNotification()

// TODO: メッセージのキャッシュのDB
