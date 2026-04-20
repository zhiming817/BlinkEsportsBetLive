import { Buffer } from 'buffer'
import 'react-native-get-random-values'
import { install } from 'react-native-quick-crypto'
import 'text-encoding-polyfill'

global.Buffer = Buffer
global.process = require('process')
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production'
global.process.browser = true

// Suppress non-fatal WebSocket errors from @solana/web3.js
const originalConsoleError = console.error
console.error = (...args) => {
  if (args[0] === 'ws error:' && args[1] === undefined) {
    return
  }
  originalConsoleError.apply(console, args)
}

install()
