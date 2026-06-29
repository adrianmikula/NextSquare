const PREFIXES = { debug: 'DEBUG', info: 'INFO ', warn: 'WARN ', error: 'ERROR' } as const
type Level = keyof typeof PREFIXES

function getLevel(): Level {
  if (typeof process === 'undefined') return 'warn'
  const env = process.env.LOG_LEVEL as Level | undefined
  if (env && env in PREFIXES) return env
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
}

const currentLevel = getLevel()
const levels: Level[] = ['debug', 'info', 'warn', 'error']

export function logger(context: string) {
  function log(level: Level, message: string, data?: unknown) {
    if (levels.indexOf(level) < levels.indexOf(currentLevel)) return
    const ts = new Date().toISOString()
    const prefix = PREFIXES[level]
    const base = `${ts} [${prefix}] [${context}] ${message}`
    if (data instanceof Error) {
      console[level](base, data.stack)
    } else if (data !== undefined) {
      console[level](base, JSON.stringify(data, null, 0))
    } else {
      console[level](base)
    }
  }
  return {
    debug: (msg: string, data?: unknown) => log('debug', msg, data),
    info: (msg: string, data?: unknown) => log('info', msg, data),
    warn: (msg: string, data?: unknown) => log('warn', msg, data),
    error: (msg: string, data?: unknown) => log('error', msg, data),
  }
}
