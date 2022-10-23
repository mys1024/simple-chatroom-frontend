import type { Message } from '~/types'

export function ignoreErrorSync<T>(fn: () => T): T | undefined {
  try {
    return fn()
  }
  catch (_) {}
}

export function isMessage(val: any): val is Message {
  return typeof val?.sender === 'string' && typeof val?.body === 'string'
}
