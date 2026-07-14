const DEBUG = import.meta.env.DEV

export const logger = {
  log: (...args) => {
    if (DEBUG) console.log(...args)
  },
  warn: (...args) => {
    if (DEBUG) console.warn(...args)
  },
  error: (...args) => {
    console.error(...args)
  },
}
