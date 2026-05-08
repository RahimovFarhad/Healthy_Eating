<template>
  <div class="toast-viewport">
    <!--
      Two always-present live regions ensure reliable AT announcements:
      - role="status" (aria-live="polite")  → success / info / warning: read at next pause
      - role="alert"  (aria-live="assertive") → errors: interrupt immediately
      Both wrappers exist in the DOM before any toast is added so screen readers
      register the live regions before content changes occur.
    -->
    <div
      role="status"
      aria-live="polite"
      aria-relevant="additions"
      aria-atomic="false"
      aria-label="Notifications"
      class="toast-live-region"
    >
      <div
        v-for="toast in politeToasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-item--${toast.type}`"
        aria-atomic="true"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
        @focusin="pauseToast(toast.id)"
        @focusout="resumeToast(toast.id)"
      >
        <span class="toast-icon" aria-hidden="true">{{ ICONS[toast.type] }}</span>
        <span class="toast-body">
          <!-- Prefix read by screen reader; invisible to sighted users -->
          <span class="visually-hidden">{{ LABELS[toast.type] }}: </span>{{ toast.message }}
        </span>
        <button
          type="button"
          class="toast-close"
          :aria-label="`Dismiss: ${toast.message}`"
          @click="removeToast(toast.id)"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>

    <div
      role="alert"
      aria-live="assertive"
      aria-relevant="additions"
      aria-atomic="false"
      aria-label="Error notifications"
      class="toast-live-region"
    >
      <div
        v-for="toast in assertiveToasts"
        :key="toast.id"
        class="toast-item toast-item--error"
        aria-atomic="true"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
        @focusin="pauseToast(toast.id)"
        @focusout="resumeToast(toast.id)"
      >
        <span class="toast-icon" aria-hidden="true">✕</span>
        <span class="toast-body">
          <span class="visually-hidden">Error: </span>{{ toast.message }}
        </span>
        <button
          type="button"
          class="toast-close"
          :aria-label="`Dismiss error: ${toast.message}`"
          @click="removeToast(toast.id)"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useToast } from '../composables/useToast.js'

const { toasts, removeToast, pauseToast, resumeToast } = useToast()

const ICONS  = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
const LABELS = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' }

const politeToasts    = computed(() => toasts.filter(t => t.type !== 'error'))
const assertiveToasts = computed(() => toasts.filter(t => t.type === 'error'))
</script>
