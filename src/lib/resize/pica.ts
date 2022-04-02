import type { Pica } from 'pica'

let _pica: Pica | undefined

export const loadPica = async () => {
  if (_pica) {
    return _pica
  }

  const Pica = (await import('pica')).default
  _pica = new Pica()
  return _pica
}
