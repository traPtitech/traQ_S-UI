import type { ManifestOptions } from 'vite-plugin-pwa'

export default {
  name: 'traQ',
  short_name: 'traQ',
  theme_color: '#0D67EA',
  icons: [
    {
      src: '/img/icons/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    },
    {
      src: '/img/icons/android-chrome-192x192-maskable.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/img/icons/android-chrome-512x512-maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ],
  start_url: '/',
  display: 'standalone',
  background_color: '#f6f7f9',
  description:
    'traQ (pronounced "track") is a messenger application built for Digital Creators Club traP. traQ allows ease communication among team members by organizing contexts into tree-structured channels.',
  screenshots: [
    {
      src: '/img/screenshots/Pixel 2 XL1.png',
      sizes: '1439x2881',
      type: 'image/png'
    },
    {
      src: '/img/screenshots/Pixel 2 XL2.png',
      sizes: '1439x2881',
      type: 'image/png'
    },
    {
      src: '/img/screenshots/Pixel 2 XL3.png',
      sizes: '1439x2881',
      type: 'image/png'
    }
  ],
  share_target: {
    action: '/share-target',
    method: 'GET',
    enctype: 'application/x-www-form-urlencoded',
    params: { title: 'title', text: 'text', url: 'url' }
  }
} satisfies Partial<ManifestOptions>
