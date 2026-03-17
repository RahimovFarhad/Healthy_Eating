// auth.js — Shared authentication state
// This file exports a reactive `isAuthenticated` flag and login/logout helpers.
// Any component can import these to read or change the auth state.
// In a real app this would validate credentials with the backend API.

import { ref } from 'vue'

export const isAuthenticated = ref(false)
export const currentUser = ref({ name: '' })

export function login(name = '') {
  isAuthenticated.value = true
  currentUser.value.name = name
}

export function logout() {
  isAuthenticated.value = false
  currentUser.value.name = ''
}
