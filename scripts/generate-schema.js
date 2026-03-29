import fs from 'node:fs/promises'
import process from 'node:process'

import { createGenerator } from 'ts-json-schema-generator'

try {
  const config = {
    path: 'config.d.ts',
    type: 'Config',
    tsconfig: 'tsconfig.json',
    topRef: false
  }

  const schema = createGenerator(config).createSchema(config.type)

  if (schema.properties) {
    schema.properties['$schema'] = { type: 'string' }
  }

  await fs.writeFile('config.schema.json', JSON.stringify(schema) + '\n')
} catch (_error) {
  process.exit(1)
}
