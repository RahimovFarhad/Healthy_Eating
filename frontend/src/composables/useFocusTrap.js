import { watch, nextTick } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Traps keyboard focus inside a container while a dialog/modal is open.
 * Moves focus into the container on open and restores it to the trigger on close.
 * Handles Escape key via the provided onClose callback.
 *
 * @param {Ref<boolean>|ComputedRef<boolean>} isOpen - reactive flag
 * @param {Ref<HTMLElement|null>} containerRef - the dialog container element
 * @param {() => void} onClose - called when Escape is pressed
 */
export function useFocusTrap(isOpen, containerRef, onClose) {
  let previousFocus = null

  watch(isOpen, async (open) => {
    if (open) {
      previousFocus = document.activeElement
      await nextTick()
      const first = containerRef.value?.querySelector(FOCUSABLE)
      first?.focus()
    } else {
      // Defer so the closing transition doesn't swallow the focus move
      await nextTick()
      previousFocus?.focus()
    }
  })

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !containerRef.value) return
    const focusable = [...containerRef.value.querySelectorAll(FOCUSABLE)]
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return { handleKeydown }
}
