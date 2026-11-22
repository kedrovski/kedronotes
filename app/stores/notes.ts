import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Note, NoteInput } from '~/types/note'
import { createId } from '~/utils/id'

function cloneInput(input: NoteInput): NoteInput {
  return {
    title: input.title,
    todos: input.todos.map((todo) => ({ ...todo })),
  }
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])

  const sortedNotes = computed(() =>
    [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  function getById(id: string): Note | undefined {
    return notes.value.find((note) => note.id === id)
  }

  function createNote(input: NoteInput): Note {
    const now = Date.now()
    const note: Note = {
      id: createId(),
      ...cloneInput(input),
      createdAt: now,
      updatedAt: now,
    }
    notes.value.push(note)
    return note
  }
  
  function updateNote(id: string, input: NoteInput): boolean {
    const note = getById(id)
    if (!note) return false

    Object.assign(note, cloneInput(input), { updatedAt: Date.now() })
    return true
  }

  function deleteNote(id: string): boolean {
    const index = notes.value.findIndex((note) => note.id === id)
    if (index === -1) return false

    notes.value.splice(index, 1)
    return true
  }

  return { notes, sortedNotes, getById, createNote, updateNote, deleteNote }
})
