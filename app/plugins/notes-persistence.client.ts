import { useNotesStore } from '~/stores/notes'
import { debounce } from '~/utils/debounce'
import { loadNotes, saveNotes } from '~/utils/notes-storage'

const SAVE_DELAY_MS = 500

export default defineNuxtPlugin(() => {
  const store = useNotesStore()

  store.setNotes(loadNotes(localStorage))

  const save = debounce(() => {
    saveNotes(localStorage, store.notes)
  }, SAVE_DELAY_MS)

  // Пишем не на каждое изменение, а пачкой через 500 мс после последнего
  store.$subscribe(() => save(), { detached: true })

  // Не теряем отложенную запись при закрытии/скрытии вкладки
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save.flush()
  })
  window.addEventListener('pagehide', () => save.flush())
})
