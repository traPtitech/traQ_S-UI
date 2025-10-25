import { createTestingPinia } from '@pinia/testing'
import {
  UserAccountState,
  type Channel,
  type Stamp,
  type User,
  type UserGroup
} from '@traptitech/traq'
import { computed, ref } from 'vue'
import useSuggesterWithoutSetup from '/@/components/Main/MainView/MessageInput/composables/suggestion/useSuggester'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'
import { channels } from '../channels/useChannelPath.spec'
import { useChannelsStore } from '/@/store/entities/channels'
import { withSetup } from '../../testUtils'

const useSuggester = withSetup(useSuggesterWithoutSetup)

describe('useSuggester', () => {
  beforeAll(() => {
    createTestingPinia()

    const { stampsMap } = useStampsStore()
    const { userGroupsMap } = useGroupsStore()
    const { usersMap } = useUsersStore()
    const { channelsMap } = useChannelsStore()

    stampsMap.value = new Map(
      NAMES.map(name => [name, { id: name, name } as Stamp])
    )

    userGroupsMap.value = new Map(
      NAMES.slice(0, NAMES.length / 2).map(name => [
        name,
        { id: name, name } as UserGroup
      ])
    )

    usersMap.value = new Map(
      NAMES.slice(NAMES.length / 2).map(name => [
        name,
        { id: name, name, state: UserAccountState.active } as User
      ])
    )

    const refinedChannels: Channel[] = channels.map(channel => ({
      ...channel,
      force: false,
      topic: '',
      children: channels
        .filter(child => child.parentId === channel.id)
        .map(c => c.id)
    }))
    channelsMap.value = new Map(refinedChannels.map(c => [c.id, c]))
  })

  test('stamps', async () => {
    const $textarea = document.createElement('textarea')
    const textarea = computed(() => $textarea)
    const text = ref('')

    const [{ suggestedCandidates, onKeyUp }] = useSuggester(textarea, text)

    text.value = $textarea.textContent = 'prev :gM'
    $textarea.selectionStart = $textarea.textContent.length
    $textarea.selectionEnd = $textarea.textContent.length + 1
    onKeyUp(new KeyboardEvent('keyup'))

    expect(suggestedCandidates.value).toStrictEqualArrayIgnoringOrder([
      {
        word: { type: 'stamp', text: ':gmLyxjRTKB', id: 'gmLyxjRTKB' },
        display: ':gmLyxjRTKB:'
      },
      {
        word: { type: 'stamp', text: ':Gm5G9atrDx', id: 'Gm5G9atrDx' },
        display: ':Gm5G9atrDx:'
      }
    ])

    text.value = $textarea.textContent = 'prev :Cg'
    $textarea.selectionStart = $textarea.textContent.length
    $textarea.selectionEnd = $textarea.textContent.length + 1
    onKeyUp(new KeyboardEvent('keyup'))

    expect(suggestedCandidates.value).toStrictEqualArrayIgnoringOrder([
      {
        word: { type: 'stamp', text: ':Cgej5PgbhB', id: 'Cgej5PgbhB' },
        display: ':Cgej5PgbhB:'
      },
      {
        word: { type: 'stamp', text: ':cG7j9nEpjg', id: 'cG7j9nEpjg' },
        display: ':cG7j9nEpjg:'
      }
    ])
  })

  test('groups and users', async () => {
    const $textarea = document.createElement('textarea')
    const textarea = computed(() => $textarea)
    const text = ref('')

    const [{ suggestedCandidates, onKeyUp }] = useSuggester(textarea, text)

    text.value = $textarea.textContent = 'prev @gM'
    $textarea.selectionStart = $textarea.textContent.length
    $textarea.selectionEnd = $textarea.textContent.length + 1
    onKeyUp(new KeyboardEvent('keyup'))

    expect(suggestedCandidates.value).toStrictEqualArrayIgnoringOrder([
      { word: { type: 'user', text: '@gmLyxjRTKB', id: 'gmLyxjRTKB' } },
      { word: { type: 'user-group', text: '@Gm5G9atrDx', id: 'Gm5G9atrDx' } }
    ])

    text.value = $textarea.textContent = 'prev @Cg'
    $textarea.selectionStart = $textarea.textContent.length
    $textarea.selectionEnd = $textarea.textContent.length + 1
    onKeyUp(new KeyboardEvent('keyup'))

    expect(suggestedCandidates.value).toStrictEqualArrayIgnoringOrder([
      { word: { type: 'user-group', text: '@Cgej5PgbhB', id: 'Cgej5PgbhB' } },
      { word: { type: 'user', text: '@cG7j9nEpjg', id: 'cG7j9nEpjg' } }
    ])
  })

  test('channels', async () => {
    const $textarea = document.createElement('textarea')
    const textarea = computed(() => $textarea)
    const text = ref('')

    const [{ suggestedCandidates, onKeyUp }] = useSuggester(textarea, text)

    text.value = $textarea.textContent = 'prev #gp'
    $textarea.selectionStart = $textarea.textContent.length
    $textarea.selectionEnd = $textarea.textContent.length + 1
    onKeyUp(new KeyboardEvent('keyup'))

    expect(suggestedCandidates.value).toStrictEqualArrayIgnoringOrder([
      {
        word: {
          delimiter: '/',
          type: 'channel',
          text: '#gps',
          id: 'a89ae3f4-64c5-49cc-acc9-aaafa4d5ee4c'
        },
        display: '#gps'
      }
    ])

    text.value = $textarea.textContent = 'prev #gps/ti'
    $textarea.selectionStart = $textarea.textContent.length
    $textarea.selectionEnd = $textarea.textContent.length + 1
    onKeyUp(new KeyboardEvent('keyup'))

    expect(suggestedCandidates.value).toStrictEqualArrayIgnoringOrder([
      {
        word: {
          type: 'channel',
          text: '#gps/times',
          id: '220832c7-9e86-40e6-bf84-b3bb28eb7c3c',
          delimiter: '/'
        },
        display: '#g/times'
      },
      {
        word: {
          type: 'channel',
          text: '#gps/tips',
          id: 'f56e6d34-1f8b-4065-85b9-b85d8762daaf',
          delimiter: '/'
        },
        display: '#g/tips'
      }
    ])

    text.value = $textarea.textContent = 'prev #gps/times/'
    $textarea.selectionStart = $textarea.textContent.length
    $textarea.selectionEnd = $textarea.textContent.length + 1
    onKeyUp(new KeyboardEvent('keyup'))

    expect(suggestedCandidates.value).toStrictEqualArrayIgnoringOrder([
      {
        word: {
          type: 'channel',
          text: '#gps/times/LongNametraPer',
          id: '6eebbc37-7025-4ced-be0d-581321e91c11',
          delimiter: '/'
        },
        display: '#g/t/LongNametraPer'
      },
      {
        word: {
          type: 'channel',
          text: '#gps/times/LongNametraPer2',
          id: '5d9210f0-9809-474d-bfbb-287cd05a7fd5',
          delimiter: '/'
        },
        display: '#g/t/LongNametraPer2'
      },
      {
        word: {
          type: 'channel',
          text: '#gps/times/ParentLongNameMayBeCut',
          id: '6636d7bf-8b4f-464e-b1c6-a8ed462b61aa',
          delimiter: '/'
        },
        display: '#g/t/ParentLongNameMayBeCut'
      },
      {
        word: {
          type: 'channel',
          text: '#gps/times/traPer1',
          id: '26f396b1-2233-4e2f-b217-a3fb511a4bf4',
          delimiter: '/'
        },
        display: '#g/t/traPer1'
      },
      {
        word: {
          type: 'channel',
          text: '#gps/times/user1',
          id: '2b287559-12a5-4a95-a420-ee08aad2208c',
          delimiter: '/'
        },
        display: '#g/t/user1'
      }
    ])
  })
})

// prettier-ignore
const NAMES = [ "2VfCJ5FJJi", "2twNJCuSH2", "32MgCwpwSW", "3TFpjGBryF", "3V2pB6gGDH", "4K_3wj7kXT", "58u4cCwWnY", "5Htb8ziPR7", "5meTSfAGb8", "6554jEW5Pj", "6P253Qxjtn", "6x9i6MxszH", "72VmF8zEX3", "76bRL2633D", "7FB_BM7c6b", "7KDMXndarY", "7TmXkpEUtK", "7cLicRySub", "7dABN6FJbb", "7ru8RQadDY", "7wNz6GBpid", "8kLt3RwnQy", "93RbBRb5be", "9LfRhgbCUQ", "9MN2VCa5wy", "9WzZDT4T7d", "9cwPTYiwg_", "9i24y9_Rm_", "AiccGy8w8Q", "Ak6f9BXV25", "BLXTuwJzkD", "BapzpyJQHT", "BgBnuV7eLZ", "BiTYrUPxTm", "C7TNuj_Wmu", "CCsKFK2gt5", "CLA2Vrfijf", "CRtxuBufin", "Cgej5PgbhB", "CpufmU24QJ", "DH49X3aUQn", "ELe5yMcWne", "EN9JDh7fSe", "EXWrUM2gXh", "Ewp2rJLguc", "FHcZAd24ua", "FJPbQBXzMM", "FTAkwDy3VY", "F_BDPGUewF", "FsaQaX9iSE", "G4Xcji3SHs", "GVNe7iF7ct", "GdwsC6Dizb", "Gm5G9atrDx", "GyxjKNQhnk", "HG2G4chCh6", "HGzdJTFcQe", "HctT_YdYrn", "HeR98P4zz9", "JhGdLjnTjY", "Jja6DXWELr", "JmFecH8G_a", "K3tmeAspeN", "KAtRbdGrZ6", "KLNy6jS2CM", "Kn6NTkfATD", "KzpK9K4WpR", "LHP2EXpsVn", "L_9kwSEchE", "M94J7z7LC9", "MMYV25TT46", "MNxkjXabUy", "MVhTCmxL3P", "MYAJTcL9Tr", "MdBb6UK2nT", "MxG3WmdetP", "MyJZbZrWTs", "N4MxP4YfHd", "N9gGdnyd8g", "NtfzB85kwV", "PG5rrzP4Yi", "PjxzGxWdj7", "QGGi9bS9nr", "QKbCkggMY5", "R4pEcetVwJ", "RBtyKzLRXH", "REfNTGQ7Xe", "RMV33sef4P", "RUAJj_fkck", "R_zNYpeFb_", "RcHDF9ZsCu", "SCjF4Ax52M", "SaLVuGJMfD", "TC2yKukXhZ", "TgyLRXXaYF", "URX7fnxgc_", "U_86V34mng", "UjRKHYuSLs", "VNJJVfVANj", "W6FR5jzDYx", "WSEHtwrMui", "WnHCT4aeN7", "X8jydAEgha", "X92e_NnerV", "XRQQbMpbYV", "XpFPBX5h_6", "XyJpcfk8DM", "YhUurkMPt2", "Z2f_GxbSY9", "ZWfWbs8dsd", "ZZGPuTApLa", "_8WtzkKdHp", "aJbfYWFwZy", "aYuwkVCQfb", "afipAnsAYB", "as3SbJACQ3", "ateisp39rj", "bH85W_ewt8", "bPzSXRHJaE", "bdC_KJx6sW", "biPYF7pNBT", "c3WuJu88Mn", "cG7j9nEpjg", "ce3C5gcXCk", "d7CcPgDQdZ", "dKju3eXYbM", "daW_RtiTAZ", "dePKa8zrBn", "e3ZfCZkVTB", "eD9RsYQsbD", "egN6FpZWnP", "f7Ma_j73ay", "fMFzmztgTD", "fQ26CKmK3N", "fdjxmaugtc", "ffHZyHGMww", "ffQRV8BFRh", "fh4Ny4Yufh", "fjxNynLChC", "g42jL8VKBi", "g5LkHwGXhH", "gK2LZmef6F", "gdKtjjJf88", "gen4rT7Uyk", "gmLyxjRTKB", "gxwHnagCHy", "hbiZn6Kiup", "i4rePZGwW5", "i89Uu_TQmb", "iMZdZpQmpX", "ies6DwAcf5", "ixZku_JVZd", "jKGwHDH6zi", "jjEeE6Ng89", "kWHuWyy9G8", "kfVzNsHeU_", "khB5jxrEcR", "kuHRWefQE3", "kyZCMVa75C", "m686UQa8gj", "m7T3SGyFuR", "mF3ugAS5D7", "mf7d6_agzy", "miQVCwpVSz", "mkJSs6bNyy", "nMPC_EA4ap", "n_T43EbBNt", "p8XzzxgeKg", "pDVnk4Mm54", "pSY3D_FdNe", "p_83VzxXrA", "peWrpinTWu", "rkUL59sAb6", "s4ZkezZLCw", "sVcKT2enFV", "siFgxCC5cn", "stjfed3BeA", "suPaVPPZ3B", "szuHc9zK8y", "tGyz28gs34", "tKsi7nUwuK", "tT7xNd9HUJ", "u52c5B7nix", "uDn_xU7Uii", "uWiBnSuJKh", "ubndKTLYbE", "unXhBcCEn7", "uwTQBaxS2r", "wFDZdpt3hR", "x4g6BASFwz", "xEgZ5KNHrS", "xH6WrNU86G", "xSew2MPESh", "xxZjC6yfB7", "yuCg7GgJCW", "z8MLeCL2ef", "zGGDCKg22F", "zGHzw5eGTa", "zPV4rmzZKk", "zwH9zQPbSH" ]
