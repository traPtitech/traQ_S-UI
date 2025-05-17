import type { StampPalette } from '@traptitech/traq'
import { computed, ref } from 'vue'

export const mockUserId = '671f2fbe-89cb-48fe-80dd-e51346ff41f6'

export const mockStampIds = ref([
  '0021b0a3-bf93-4903-9b16-67dfd80797c7',
  '002f9f83-a453-45fe-8d57-78ee5eb92c94',
  '00ca46e8-8b37-4f64-a99e-f1424503b06e',
  '00f87682-7f2a-49ec-87ab-c744afdc0c0d',
  '00fba017-15ae-497d-8035-4e1b35133318',
  '01426f05-b61f-4928-96a7-fd036e7050bb',
  '0172bfa4-d085-4294-965f-f0dbcabaedbe',
  '0192bf18-e6aa-703a-9d18-e0c8fc222754',
  '0192d3a9-ede9-7f9c-aa41-4d2a2e4d75b0',
  '0192d3aa-2922-7f9c-9a94-5c1a2a093a09',
  '01931d62-2d7a-7dbd-a615-f31910e881f0',
  '01931d66-f93c-7dbd-8e3e-8af82318e1ce',
  '01949888-058f-7f29-a56a-9dc8c45faabe',
  '019664e1-acd4-7668-a1c1-fdb634820111',
  '019664e1-cdad-7668-acb2-0ea1a46f089e',
  '019de21e-84f8-4d27-a6c6-6cf2f8296818',
  '01a9c436-accf-496e-ab5c-0b7f3b94140a',
  '01bf002c-366a-4107-8a54-b074d771651d',
  '01c511ae-738f-4772-a21c-cc9edf794df4',
  '01c853ae-876b-4ec3-8fba-4d381a9a27c6',
  '01ef9240-162a-4398-9c8a-6b6c9f9d8fa0',
  '01fe364b-bf4b-402a-bdbe-362f42c2cdf9',
  '02100aab-c045-4356-a053-0e6615eae508',
  '02325ae6-c7f4-450c-9036-162422be46ed',
  '0257abda-7c51-47f2-bce6-a3870c2bd2e8',
  '0782a095-8b60-4813-8e7a-140af965318f',
  '07a252f7-e36d-4845-a1f8-675e69fac5ca',
  '07a64a69-3b41-41a0-8e02-10a4e6aa770f',
  '07ad60ce-36cc-4209-8e5a-5f196f274d50',
  '07af15d6-200f-4a18-be45-0f1564ad6d00',
  '07c70449-996b-405f-9daf-7769d1756206',
  '07cdbe26-57ce-4407-b627-dca9f61c4e80',
  '07dcdea9-ae52-44e8-8087-b70a49803ffd',
  '07fc67fb-9003-41ad-839c-81b4fc999609',
  '080577fb-0e80-4955-842d-c5099636e037',
  '082f9008-b810-45de-93d9-883f12ef38be',
  '085796bb-5353-413d-9953-4a45e26403f0',
  '087fc606-a620-4aa9-bf17-016bb891ffec',
  '08958d1f-4c75-4885-a557-5fe4153c0da0',
  '08bd37c1-1037-4051-96a0-c69eb3545312',
  '08c623a4-f8c2-455d-b323-dad73692e976'
])

export const mockStampPalettes: StampPalette[] = [
  {
    id: '1',
    name: 'mock1',
    stamps: mockStampIds.value,
    creatorId: mockUserId,
    createdAt: new Date('2023-01-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2023-01-20T11:30:00Z').toISOString(),
    description: 'mock1'
  },
  {
    id: '2',
    name: 'mock2',
    stamps: mockStampIds.value.slice(0, 15),
    creatorId: mockUserId,
    createdAt: new Date('2023-02-01T14:20:10Z').toISOString(),
    updatedAt: new Date('2023-02-01T14:20:10Z').toISOString(),
    description: 'mock2'
  },
  {
    id: '3',
    name: 'mock3',
    stamps: mockStampIds.value.slice(0, 10),
    creatorId: mockUserId,
    createdAt: new Date('2023-03-10T09:00:00Z').toISOString(),
    updatedAt: new Date('2023-03-12T16:45:00Z').toISOString(),
    description: 'mock3'
  },
  {
    id: '4',
    name: 'mock4',
    stamps: mockStampIds.value.slice(0, 5),
    creatorId: mockUserId,
    createdAt: new Date().toISOString(), // 現在時刻
    updatedAt: new Date().toISOString(), // 現在時刻
    description: 'mock4'
  }
]

export const mockStampPalettesMap = computed(() => {
  const map = new Map<string, StampPalette>()
  mockStampPalettes.forEach(palette => {
    map.set(palette.id, palette)
  })
  return map
})
