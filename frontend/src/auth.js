import { ref } from 'vue'

let _accessToken = null

export const isAuthenticated = ref(false)
export const currentUser     = ref({ name: '', userId: null, role: null })
export const authError       = ref('')

function setSession(token) {
  _accessToken          = token
  isAuthenticated.value = true
  authError.value       = ''

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    currentUser.value = {
      name:   payload.email?.split('@')[0] ?? '',
      userId: payload.userId ?? null,
      role:   payload.role   ?? null,
    }
  } catch {
    currentUser.value = { name: '', userId: null, role: null }
  }
}

function clearSession() {
  _accessToken          = null
  isAuthenticated.value = false
  currentUser.value     = { name: '', userId: null, role: null }
}

export async function login(email, password) {
  authError.value = ''
  const res = await fetch('/api/auth/login', {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',
    body:        JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    authError.value = data.message ?? 'Login failed'
    return false
  }

  setSession(data.token)
  return true
}

export async function register(email, username, password) {
  authError.value = ''
  const res = await fetch('/api/auth/register', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, username, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    authError.value = data.message ?? 'Registration failed'
    return false
  }

  return true
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  } catch { /* ignore network errors */ }
  clearSession()
}

export async function tryRefresh() {
  try {
    const res = await fetch('/api/auth/refresh', {
      method:      'GET',
      credentials: 'include',
    })

    if (!res.ok) return false

    const data = await res.json()
    setSession(data.token)
    return true
  } catch {
    return false
  }
}

export async function apiFetch(path, options = {}) {
  const makeRequest = (token) => fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  let res = await makeRequest(_accessToken)

  if (res.status !== 401) return res

  const refreshed = await tryRefresh()
  if (!refreshed) {
    clearSession()
    return res
  }

  res = await makeRequest(_accessToken)

  if (res.status === 401) clearSession()

  return res
}
