import type { Note, TodoItem } from '~/types/note'

export const NOTES_STORAGE_KEY = 'kedronotes:notes'
export const SCHEMA_VERSION = 1

export interface StoredNotes {
  version: number
  notes: Note[]
}

export interface KeyValueStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

interface VersionedData {
  version: number
  [key: string]: unknown
}

type Migration = (data: VersionedData) => VersionedData

export const migrations: Record<number, Migration> = {}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTodoItem(value: unknown): value is TodoItem {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.done === 'boolean'
  )
}

function isNote(value: unknown): value is Note {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    Array.isArray(value.todos) &&
    value.todos.every(isTodoItem)
  )
}

export function serializeNotes(notes: Note[]): string {
  const data: StoredNotes = { version: SCHEMA_VERSION, notes }
  return JSON.stringify(data)
}

export function parseNotes(raw: string | null): Note[] {
  if (!raw) return []

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    console.warn('[notes-storage] Не удалось разобрать сохранённые данные')
    return []
  }

  if (!isObject(data) || typeof data.version !== 'number') {
    console.warn('[notes-storage] Неизвестный формат данных')
    return []
  }

  let current = data as VersionedData
  while (current.version < SCHEMA_VERSION) {
    const migrate = migrations[current.version]
    if (!migrate) {
      console.warn(`[notes-storage] Нет миграции с версии ${current.version}`)
      return []
    }
    current = migrate(current)
  }

  if (current.version > SCHEMA_VERSION) {
    console.warn(`[notes-storage] Версия данных ${current.version} новее поддерживаемой`)
    return []
  }

  if (!Array.isArray(current.notes)) return []

  return current.notes.filter(isNote)
}

export function loadNotes(storage: KeyValueStorage): Note[] {
  try {
    return parseNotes(storage.getItem(NOTES_STORAGE_KEY))
  } catch {
    return []
  }
}

export function saveNotes(storage: KeyValueStorage, notes: Note[]): boolean {
  try {
    storage.setItem(NOTES_STORAGE_KEY, serializeNotes(notes))
    return true
  } catch (error) {
    console.error('[notes-storage] Не удалось сохранить заметки', error)
    return false
  }
}
