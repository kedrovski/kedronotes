import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotesStore } from '~/stores/notes'
import type { NoteInput } from '~/types/note'

function makeInput(title = 'Покупки'): NoteInput {
  return {
    title,
    todos: [
      { id: 't1', text: 'Молоко', done: false },
      { id: 't2', text: 'Хлеб', done: true },
    ],
  }
}

describe('notes store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates a note with id and timestamps', () => {
    const store = useNotesStore()
    const note = store.createNote(makeInput())

    expect(note.id).toBeTruthy()
    expect(note.title).toBe('Покупки')
    expect(note.todos).toHaveLength(2)
    expect(note.createdAt).toBe(note.updatedAt)
    expect(store.getById(note.id)).toEqual(note)
  })

  it('does not keep references to the input data', () => {
    const store = useNotesStore()
    const input = makeInput()
    const note = store.createNote(input)

    input.todos[0]!.text = 'Изменено снаружи'
    input.todos.push({ id: 't3', text: 'Лишний', done: false })

    expect(store.getById(note.id)!.todos[0]!.text).toBe('Молоко')
    expect(store.getById(note.id)!.todos).toHaveLength(2)
  })

  it('updates a note and bumps updatedAt', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    const store = useNotesStore()
    const note = store.createNote(makeInput())

    vi.setSystemTime(2000)
    const result = store.updateNote(note.id, { title: 'Новое', todos: [] })

    expect(result).toBe(true)
    const updated = store.getById(note.id)!
    expect(updated.title).toBe('Новое')
    expect(updated.todos).toEqual([])
    expect(updated.createdAt).toBe(1000)
    expect(updated.updatedAt).toBe(2000)
    vi.useRealTimers()
  })

  it('returns false when updating a missing note', () => {
    const store = useNotesStore()
    expect(store.updateNote('missing', makeInput())).toBe(false)
    expect(store.notes).toHaveLength(0)
  })

  it('deletes a note', () => {
    const store = useNotesStore()
    const note = store.createNote(makeInput())

    expect(store.deleteNote(note.id)).toBe(true)
    expect(store.getById(note.id)).toBeUndefined()
    expect(store.deleteNote(note.id)).toBe(false)
  })

  it('replaces the whole list with setNotes', () => {
    const store = useNotesStore()
    store.createNote(makeInput())

    const loaded = [{ id: 'x', title: 'Из хранилища', todos: [], createdAt: 1, updatedAt: 1 }]
    store.setNotes(loaded)

    expect(store.notes).toEqual(loaded)
  })

  it('sorts notes by updatedAt, newest first', () => {
    vi.useFakeTimers()
    const store = useNotesStore()

    vi.setSystemTime(1000)
    const first = store.createNote(makeInput('Первая'))
    vi.setSystemTime(2000)
    const second = store.createNote(makeInput('Вторая'))
    vi.setSystemTime(3000)
    store.updateNote(first.id, makeInput('Первая, изменена'))

    expect(store.sortedNotes.map((n) => n.id)).toEqual([first.id, second.id])
    vi.useRealTimers()
  })
})
