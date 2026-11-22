export interface Debounced {
  /** Запланировать вызов (повторный вызов переносит таймер) */
  (): void
  /** Выполнить отложенный вызов немедленно (если он есть) */
  flush: () => void
  /** Отменить отложенный вызов */
  cancel: () => void
}

export function debounce(fn: () => void, wait: number): Debounced {
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel() {
    clearTimeout(timer)
    timer = undefined
  }

  function flush() {
    if (timer === undefined) return
    cancel()
    fn()
  }

  function debounced() {
    clearTimeout(timer)
    timer = setTimeout(flush, wait)
  }

  debounced.flush = flush
  debounced.cancel = cancel

  return debounced
}
