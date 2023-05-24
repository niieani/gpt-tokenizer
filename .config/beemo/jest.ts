import { JestConfig } from '@beemo/driver-jest'

const config: JestConfig = {
  moduleNameMapper: {
    '^(\\.\\.?\\/.+)\\.jsx?$': '$1',
  },
}

export default config
