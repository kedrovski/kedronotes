import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from '~/utils/debounce'

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls the function once after the last call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 500)

    debounced()
    debounced()
    vi.advanceTimersByTime(499)
    expect(fn).not.toHaveBeenCalled()

    debounced()
    vi.advanceTimersByTime(499)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('flush runs the pending call immediately', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 500)

    debounced()
    debounced.flush()
    expect(fn).toHaveBeenCalledOnce()

    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('flush does nothing when there is no pending call', () => {
    const fn = vi.fn()
    debounce(fn, 500).flush()
    expect(fn).not.toHaveBeenCalled()
  })

  it('cancel drops the pending call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 500)

    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(1000)
    debounced.flush()
    expect(fn).not.toHaveBeenCalled()
  })
})
