import type { ResolvedBasicTheme } from '/@/lib/theme/resolve/basic'
import { resolveBasicTheme } from '/@/lib/theme/resolve/basic'
import type { BasicTheme } from '/@/lib/theme/schema'

describe('resolveBasicTheme', () => {
  const tests: Array<{
    name: string
    input: BasicTheme
    expected: ResolvedBasicTheme
  }> = [
    {
      name: 'can resolve from fallback',
      input: {
        accent: {
          primary: '#000000',
          notification: '#000001',
          online: '#000002',
          error: '#000003',
          focus: '#000004'
        },
        background: {
          primary: '#000010',
          secondary: '#000011',
          tertiary: '#000012'
        },
        ui: {
          primary: '#000020',
          secondary: '#000021',
          tertiary: '#000022'
        },
        text: {
          primary: '#000030',
          secondary: '#000031'
        }
      },
      expected: {
        accent: {
          primary: {
            default: '#000000',
            background: '#000000',
            inactive: 'rgba(0, 0, 0, 0.5)',
            fallback: '#000000'
          },
          notification: {
            default: '#000001',
            background: '#000001',
            fallback: '#000001'
          },
          online: {
            default: '#000002'
          },
          error: {
            default: '#000003'
          },
          focus: {
            default: '#000004'
          }
        },
        background: {
          primary: {
            default: '#000010',
            border: '#000010',
            fallback: '#000010'
          },
          secondary: {
            default: '#000011',
            border: '#000011',
            fallback: '#000011'
          },
          tertiary: {
            default: '#000012',
            border: '#000012',
            fallback: '#000012'
          }
        },
        ui: {
          primary: {
            default: '#000020',
            background: '#000020',
            inactive: 'rgba(0, 0, 32, 0.5)',
            fallback: '#000020'
          },
          secondary: {
            default: '#000021',
            background: '#000021',
            inactive: 'rgba(0, 0, 33, 0.5)',
            fallback: '#000021'
          },
          tertiary: {
            default: '#000022'
          }
        },
        text: {
          primary: {
            default: '#000030'
          },
          secondary: {
            default: '#000031'
          }
        }
      }
    },
    {
      name: 'can resolve',
      input: {
        accent: {
          primary: {
            default: '#000000',
            background: '#100000',
            inactive: '#200000',
            fallback: '#300000'
          },
          notification: {
            default: '#000001',
            background: '#100001',
            fallback: '#200001'
          },
          online: '#000002',
          error: '#000003',
          focus: '#000004'
        },
        background: {
          primary: {
            default: '#000010',
            border: '#100010',
            fallback: '#200010'
          },
          secondary: {
            default: '#000011',
            border: '#100011',
            fallback: '#200011'
          },
          tertiary: {
            default: '#000012',
            border: '#100012',
            fallback: '#200012'
          }
        },
        ui: {
          primary: {
            default: '#000020',
            background: '#100020',
            inactive: '#200020',
            fallback: '#300020'
          },
          secondary: {
            default: '#000021',
            background: '#100021',
            inactive: '#200021',
            fallback: '#300021'
          },
          tertiary: '#000022'
        },
        text: {
          primary: '#000030',
          secondary: '#000031'
        }
      },
      expected: {
        accent: {
          primary: {
            default: '#000000',
            background: '#100000',
            inactive: '#200000',
            fallback: '#300000'
          },
          notification: {
            default: '#000001',
            background: '#100001',
            fallback: '#200001'
          },
          online: {
            default: '#000002'
          },
          error: {
            default: '#000003'
          },
          focus: {
            default: '#000004'
          }
        },
        background: {
          primary: {
            default: '#000010',
            border: '#100010',
            fallback: '#200010'
          },
          secondary: {
            default: '#000011',
            border: '#100011',
            fallback: '#200011'
          },
          tertiary: {
            default: '#000012',
            border: '#100012',
            fallback: '#200012'
          }
        },
        ui: {
          primary: {
            default: '#000020',
            background: '#100020',
            inactive: '#200020',
            fallback: '#300020'
          },
          secondary: {
            default: '#000021',
            background: '#100021',
            inactive: '#200021',
            fallback: '#300021'
          },
          tertiary: {
            default: '#000022'
          }
        },
        text: {
          primary: {
            default: '#000030'
          },
          secondary: {
            default: '#000031'
          }
        }
      }
    }
  ]

  for (const t of tests) {
    test(t.name, () => {
      const actual = resolveBasicTheme(t.input)
      expect(actual).toStrictEqual(t.expected)
    })
  }
})
