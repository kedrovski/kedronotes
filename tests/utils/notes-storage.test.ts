import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Note } from '~/types/note'
import {
  type KeyValueStorage,
  loadNotes,
  migrations,
  NOTES_STORAGE_KEY,
  parseNotes,
  saveNotes,
  SCHEMA_VERSION,
  serializeNotes,
} from '~/utils/notes-storage'

const note: Note = {
  id: 'n1',
  title: 'Покупки',
  todos: [{ id: 't1', text: 'Молоко', done: false }],
  createdAt: 1000,
  updatedAt: 2000,
}

function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
}

describe('notes storage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores the schema version along with notes', () => {
    const data = JSON.parse(serializeNotes([note]))
    expect(data).toEqual({ version: SCHEMA_VERSION, notes: [note] })
  })

  it('round-trips notes through serialize/parse', () => {
    expect(parseNotes(serializeNotes([note]))).toEqual([note])
  })

  it('returns an empty list for empty storage', () => {
    expect(parseNotes(null)).toEqual([])
    expect(parseNotes('')).toEqual([])
  })

  it('returns an empty list for broken JSON or unknown format', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseNotes('{not json')).toEqual([])
    expect(parseNotes('[1, 2, 3]')).toEqual([])
    expect(parseNotes('{"notes": []}')).toEqual([])
  })

  it('skips invalid notes but keeps valid ones', () => {
    const raw = JSON.stringify({
      version: SCHEMA_VERSION,
      notes: [note, { id: 'bad' }, { ...note, id: 'n2', todos: [{ text: 1 }] }],
    })
    expect(parseNotes(raw)).toEqual([note])
  })

  it('ignores data from a newer schema version', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const raw = JSON.stringify({ version: SCHEMA_VERSION + 1, notes: [note] })
    expect(parseNotes(raw)).toEqual([])
  })

  it('applies migrations from older versions', () => {
    // Представим, что в версии 0 поле называлось label вместо text
    migrations[0] = (data) => ({
      version: 1,
      notes: (data.notes as Array<Record<string, unknown>>).map((n) => ({
        ...n,
        todos: (n.todos as Array<Record<string, unknown>>).map(({ label, ...rest }) => ({
          ...rest,
          text: label,
        })),
      })),
    })

    const legacy = JSON.stringify({
      version: 0,
      notes: [{ ...note, todos: [{ id: 't1', label: 'Молоко', done: false }] }],
    })

    try {
      expect(parseNotes(legacy)).toEqual([note])
    } finally {
      delete migrations[0]
    }
  })

  it('loads and saves through the storage', () => {
    const storage = createMemoryStorage()

    expect(saveNotes(storage, [note])).toBe(true)
    expect(storage.getItem(NOTES_STORAGE_KEY)).toBe(serializeNotes([note]))
    expect(loadNotes(storage)).toEqual([note])
  })

  it('does not throw when the storage is unavailable', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }

    expect(loadNotes(broken)).toEqual([])
    expect(saveNotes(broken, [note])).toBe(false)
  })
})
