import {
  ResolvedBasicTheme,
  resolveBasicTheme
} from '/@/lib/theme/resolve/basic'
import { BasicTheme } from '/@/lib/theme/schema'

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
            fallback: '#000000'
          },
          notification: {
            default: '#000001',
            background: '#000001'
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
            border: '#000012'
          }
        },
        ui: {
          primary: {
            default: '#000020',
            background: '#000020',
            fallback: '#000020'
          },
          secondary: {
            default: '#000021',
            background: '#000021',
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
            fallback: '#200000'
          },
          notification: {
            default: '#000001',
            background: '#100001'
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
            border: '#100012'
          }
        },
        ui: {
          primary: {
            default: '#000020',
            background: '#100020',
            fallback: '#200020'
          },
          secondary: {
            default: '#000021',
            background: '#100021',
            fallback: '#200021'
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
            fallback: '#200000'
          },
          notification: {
            default: '#000001',
            background: '#100001'
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
            border: '#100012'
          }
        },
        ui: {
          primary: {
            default: '#000020',
            background: '#100020',
            fallback: '#200020'
          },
          secondary: {
            default: '#000021',
            background: '#100021',
            fallback: '#200021'
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
