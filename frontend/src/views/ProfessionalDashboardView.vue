<!--
  ProfessionalDashboardView.vue — Dashboard shown to users with role="professional"

  Wires up every endpoint exposed by the backend professional module:
    • GET    /professional/clients                              (list)
    • GET    /professional/clients?include=details              (list with details)
    • POST   /professional/client-invitations                   (invite by subscriberId)
    • DELETE /professional/clients/:clientId                    (remove)
    • GET    /professional/clients/:clientId/dashboard          (per-client dashboard)
    • GET    /professional/clients/:clientId/summary            (per-period summary)
    • GET    /professional/clients/:clientId/goals              (list goals)
    • POST   /professional/clients/:clientId/goals              (set goal)
    • GET    /professional/clients/:clientId/messages           (list messages)
    • POST   /professional/clients/:clientId/messages           (send message)
-->
<template>
  <div class="container-fluid px-4 py-3">

    <!-- ============================================================
         WELCOME BANNER + TOP CONTROLS
         ============================================================ -->
    <div class="d-flex justify-content-between align-items-center p-3 mb-3 rounded"
         style="background:#e8f4e6;border:1px solid #5a9e56;">
      <div>
        <h4 style="color:#5a9e56;" class="mb-0">Professional Dashboard 👨‍⚕️</h4>
        <small class="text-secondary">{{ today }} — manage and review your assigned clients</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="showDetails"
                 v-model="showDetails" @change="loadClients">
          <label class="form-check-label small" for="showDetails">Show details</label>
        </div>
        <button class="btn btn-gf btn-sm" @click="showInvite = !showInvite">
          {{ showInvite ? '✕ Cancel' : '+ Invite Client' }}
        </button>
      </div>
    </div>

    <!-- ============================================================
         INVITE PANEL
         ============================================================ -->
    <div v-if="showInvite" class="add-meal-panel mb-3">
      <h6 class="fw-bold mb-2" style="color:#5a9e56;">Invite a Subscriber</h6>
      <p class="text-muted small mb-2">
        Ask the subscriber for their User ID (visible on their Profile page) and enter it below.
      </p>
      <div class="d-flex gap-2 align-items-end">
        <div style="flex:1;max-width:200px;">
          <label class="form-label form-label-sm">Subscriber User ID</label>
          <input type="number" class="form-control form-control-sm"
                 v-model.number="inviteId" min="1" placeholder="e.g. 42">
        </div>
        <button class="btn btn-gf btn-sm" @click="sendInvite" :disabled="inviteLoading || !inviteId">
          {{ inviteLoading ? '…' : 'Send Invite' }}
        </button>
      </div>
      <div v-if="inviteError"   class="alert alert-danger py-2 small mt-2 mb-0">{{ inviteError }}</div>
      <div v-if="inviteSuccess" class="alert alert-success py-2 small mt-2 mb-0">{{ inviteSuccess }}</div>
    </div>

    <!-- ============================================================
         CLIENT LIST
         ============================================================ -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="fw-bold mb-0" style="color:#5a9e56;">Your Clients</h5>
      <span class="badge" style="background:#5a9e56;font-size:0.75rem;">
        {{ clients.length }} active
      </span>
    </div>

    <div v-if="loading" class="text-center text-muted py-4">
      <small>Loading clients…</small>
    </div>

    <div v-else-if="error" class="alert alert-danger small">{{ error }}</div>

    <div v-else-if="clients.length === 0"
         class="text-center text-muted py-4 border rounded"
         style="border-style:dashed!important;">
      <p class="mb-1">No active clients yet.</p>
      <small>Invite a subscriber using their User ID — they'll appear here once they accept.</small>
    </div>

    <div v-else>
      <div v-for="client in clients" :key="client.id" class="card card-gf mb-2">

        <!-- ---- Collapsible header ---- -->
        <div class="card-header d-flex justify-content-between align-items-center"
             style="cursor:pointer;"
             @click="toggleClient(client)">
          <div class="d-flex align-items-center gap-3">
            <div class="avatar-circle" style="width:38px;height:38px;font-size:0.85rem;">
              {{ initialsFor(client.subscriber.fullName) }}
            </div>
            <div>
              <div class="fw-bold small">{{ client.subscriber.fullName }}</div>
              <div class="text-muted" style="font-size:0.75rem;">
                {{ client.subscriber.email }} · ID {{ client.subscriberId }}
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm py-0 px-2"
                    style="background:#fde8e8;border:1px solid #d99;color:#c44;"
                    title="Remove client"
                    @click.stop="removeClient(client)">✕ Remove</button>
            <span style="color:#5a9e56;font-weight:bold;">
              {{ expandedId === client.id ? '▲' : '▼' }}
            </span>
          </div>
        </div>

        <!-- ---- Expanded details panel ---- -->
        <div v-if="expandedId === client.id" class="card-body">

          <!-- Tab switcher -->
          <div class="d-flex gap-2 mb-3 border-bottom pb-2">
            <button v-for="tab in tabs" :key="tab.id"
                    class="btn btn-sm"
                    :class="activeTab[client.id] === tab.id ? 'btn-gf' : 'btn-outline-secondary'"
                    @click="setTab(client, tab.id)">
              {{ tab.label }}
            </button>
          </div>

          <!-- ---- TAB: Dashboard ---- -->
          <div v-if="activeTab[client.id] === 'dashboard'">
            <div v-if="client.dashboard.loading" class="text-muted small">Loading…</div>
            <div v-else-if="client.dashboard.error" class="alert alert-danger small mb-0">
              {{ client.dashboard.error }}
            </div>
            <div v-else-if="client.dashboard.data" class="row g-3">
              <div class="col-md-6">
                <h6 class="fw-bold mb-2" style="color:#5a9e56;">📓 Recent Diary</h6>
                <div v-if="recentEntries(client.dashboard.data).length === 0"
                     class="text-muted small">No entries logged yet.</div>
                <ul v-else class="list-unstyled small mb-0">
                  <li v-for="entry in recentEntries(client.dashboard.data)" :key="entry.diaryEntryId"
                      class="mb-1 pb-1 border-bottom">
                    <span class="fw-semibold">{{ entry.mealType }}</span>
                    <span class="text-muted ms-1">— {{ formatDate(entry.consumedAt) }}</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6" v-if="riskSnapshots(client.dashboard.data).length">
                <h6 class="fw-bold mb-2" style="color:#5a9e56;">⚠ Recent Risk Flags</h6>
                <ul class="list-unstyled small mb-0">
                  <li v-for="snap in riskSnapshots(client.dashboard.data)" :key="snap.snapshotId"
                      class="mb-1 pb-1 border-bottom">
                    <span class="badge me-2"
                          :style="`background:${severityColor(snap.riskLevel)};font-size:0.65rem;`">
                      {{ snap.riskLevel }}
                    </span>
                    <span class="fw-semibold">{{ snap.rule?.name ?? 'Rule' }}</span>
                    <span class="text-muted ms-1" v-if="snap.reason">— {{ snap.reason }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- ---- TAB: Summary ---- -->
          <div v-if="activeTab[client.id] === 'summary'">
            <div class="d-flex gap-2 align-items-end mb-3">
              <div>
                <label class="form-label form-label-sm">Period</label>
                <select class="form-select form-select-sm" v-model="client.summary.period">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label class="form-label form-label-sm">End Date</label>
                <input type="date" class="form-control form-control-sm"
                       v-model="client.summary.endDate">
              </div>
              <button class="btn btn-gf btn-sm" @click="loadSummary(client)"
                      :disabled="client.summary.loading">
                {{ client.summary.loading ? '…' : 'Load' }}
              </button>
            </div>
            <div v-if="client.summary.error" class="alert alert-danger small">{{ client.summary.error }}</div>
            <pre v-if="client.summary.data"
                 class="small p-2 rounded"
                 style="background:#f7f7f7;max-height:300px;overflow:auto;">{{ JSON.stringify(client.summary.data, null, 2) }}</pre>
            <div v-if="!client.summary.data && !client.summary.error && !client.summary.loading"
                 class="text-muted small">Select a period and end date, then press Load.</div>
          </div>

          <!-- ---- TAB: Goals ---- -->
          <div v-if="activeTab[client.id] === 'goals'">
            <div v-if="client.goals.loading" class="text-muted small">Loading…</div>
            <div v-else-if="client.goals.error" class="alert alert-danger small">{{ client.goals.error }}</div>
            <div v-else>
              <div v-if="(client.goals.data ?? []).length === 0"
                   class="text-muted small mb-3">No goals set.</div>
              <ul v-else class="list-unstyled small mb-3">
                <li v-for="goal in client.goals.data" :key="goal.goalId"
                    class="mb-1 pb-1 border-bottom">
                  <span class="fw-semibold">{{ goal.nutrient?.name ?? 'Custom goal' }}</span>
                  <span class="text-muted ms-1">{{ goalRange(goal) }}</span>
                  <span class="badge ms-1"
                        :style="`background:${goalSourceColor(goal.source)};font-size:0.65rem;`">
                    {{ goal.source }}
                  </span>
                </li>
              </ul>

              <!-- Set goal form -->
              <div class="add-meal-panel">
                <h6 class="fw-bold mb-2" style="color:#5a9e56;">Set a Goal</h6>
                <div class="row g-2 mb-2">
                  <div class="col-md-4">
                    <label class="form-label form-label-sm">Nutrient ID (optional)</label>
                    <input type="number" class="form-control form-control-sm"
                           v-model.number="client.goalDraft.nutrientId" min="1">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">Target Min</label>
                    <input type="number" class="form-control form-control-sm"
                           v-model.number="client.goalDraft.targetMin">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">Target Max</label>
                    <input type="number" class="form-control form-control-sm"
                           v-model.number="client.goalDraft.targetMax">
                  </div>
                </div>
                <div class="row g-2 mb-2">
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">Start Date</label>
                    <input type="date" class="form-control form-control-sm"
                           v-model="client.goalDraft.startDate">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label form-label-sm">End Date</label>
                    <input type="date" class="form-control form-control-sm"
                           v-model="client.goalDraft.endDate">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label form-label-sm">Notes (required)</label>
                    <input type="text" class="form-control form-control-sm"
                           v-model="client.goalDraft.notes" placeholder="Why are you setting this goal?">
                  </div>
                </div>
                <button class="btn btn-gf btn-sm" @click="setGoal(client)"
                        :disabled="client.goalDraft.saving">
                  {{ client.goalDraft.saving ? '…' : 'Save Goal' }}
                </button>
                <div v-if="client.goalDraft.error" class="alert alert-danger small mt-2 mb-0">
                  {{ client.goalDraft.error }}
                </div>
              </div>
            </div>
          </div>

          <!-- ---- TAB: Messages ---- -->
          <div v-if="activeTab[client.id] === 'messages'">
            <div v-if="client.messages.loading" class="text-muted small">Loading…</div>
            <div v-else-if="client.messages.error" class="alert alert-danger small">{{ client.messages.error }}</div>
            <div v-else>
              <div class="border rounded p-2 mb-2"
                   style="max-height:240px;overflow-y:auto;background:#fafafa;">
                <div v-if="(client.messages.data ?? []).length === 0"
                     class="text-muted small text-center py-3">No messages yet.</div>
                <div v-for="msg in client.messages.data" :key="msg.id" class="mb-2">
                  <div :class="msg.sentBy === 'professional' ? 'chat-mine ms-auto' : 'chat-pro'"
                       style="max-width:80%;">
                    <div class="small">{{ msg.message }}</div>
                    <div class="text-muted mt-1" style="font-size:0.65rem;">
                      {{ formatDateTime(msg.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm"
                       placeholder="Type a message…"
                       v-model="client.messageDraft.text"
                       @keyup.enter="sendMessage(client)">
                <button class="btn btn-gf btn-sm" @click="sendMessage(client)"
                        :disabled="client.messageDraft.sending || !client.messageDraft.text.trim()">
                  {{ client.messageDraft.sending ? '…' : 'Send' }}
                </button>
              </div>
              <div v-if="client.messageDraft.error" class="alert alert-danger small mt-2 mb-0">
                {{ client.messageDraft.error }}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiFetch } from '../auth.js'

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

const tabs = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'summary',   label: '📈 Summary'   },
  { id: 'goals',     label: '🎯 Goals'     },
  { id: 'messages',  label: '💬 Messages'  },
]

const clients      = ref([])
const loading      = ref(true)
const error        = ref('')
const expandedId   = ref(null)
const showDetails  = ref(false)
const activeTab    = reactive({})  // { [clientId]: tabId }

// Invite panel state
const showInvite    = ref(false)
const inviteId      = ref(null)
const inviteLoading = ref(false)
const inviteError   = ref('')
const inviteSuccess = ref('')

const todayIso = () => new Date().toISOString().slice(0, 10)

function blankClientState() {
  return {
    dashboard: { loading: false, error: '', data: null },
    summary:   { loading: false, error: '', data: null,
                 period: 'daily', endDate: todayIso() },
    goals:     { loading: false, error: '', data: null },
    goalDraft: { nutrientId: null, targetMin: null, targetMax: null,
                 startDate: todayIso(), endDate: '', notes: '',
                 saving: false, error: '' },
    messages:    { loading: false, error: '', data: null },
    messageDraft:{ text: '', sending: false, error: '' },
  }
}

onMounted(loadClients)

async function loadClients() {
  loading.value = true
  error.value   = ''
  try {
    const url = showDetails.value
      ? '/api/professional/clients?include=details'
      : '/api/professional/clients'
    const res = await apiFetch(url)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      error.value = data.message || data.error || 'Failed to load clients'
      return
    }
    const data = await res.json()
    clients.value = (data.clients ?? []).map(c => ({ ...c, ...blankClientState() }))
  } catch {
    error.value = 'Network error — could not load clients'
  } finally {
    loading.value = false
  }
}

async function sendInvite() {
  inviteError.value = ''
  inviteSuccess.value = ''
  inviteLoading.value = true
  try {
    const res = await apiFetch('/api/professional/client-invitations', {
      method: 'POST',
      body: JSON.stringify({ subscriberId: Number(inviteId.value) }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      inviteError.value = data.error || data.message || 'Invitation failed'
      return
    }
    inviteSuccess.value = `Invitation sent to user #${inviteId.value}.`
    inviteId.value = null
  } catch {
    inviteError.value = 'Network error — could not send invitation'
  } finally {
    inviteLoading.value = false
  }
}

async function removeClient(client) {
  if (!confirm(`Remove ${client.subscriber.fullName} from your clients?`)) return
  try {
    const res = await apiFetch(`/api/professional/clients/${client.subscriberId}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || data.message || 'Removal failed')
      return
    }
    clients.value = clients.value.filter(c => c.id !== client.id)
    if (expandedId.value === client.id) expandedId.value = null
  } catch {
    alert('Network error — could not remove client')
  }
}

function toggleClient(client) {
  if (expandedId.value === client.id) {
    expandedId.value = null
    return
  }
  expandedId.value = client.id
  if (!activeTab[client.id]) activeTab[client.id] = 'dashboard'
  loadTab(client, activeTab[client.id])
}

function setTab(client, tabId) {
  activeTab[client.id] = tabId
  loadTab(client, tabId)
}

function loadTab(client, tabId) {
  if (tabId === 'dashboard' && !client.dashboard.data && !client.dashboard.loading) {
    loadDashboard(client)
  } else if (tabId === 'goals' && !client.goals.data && !client.goals.loading) {
    loadGoals(client)
  } else if (tabId === 'messages' && !client.messages.data && !client.messages.loading) {
    loadMessages(client)
  }
  // Summary is loaded explicitly via the Load button
}

async function loadDashboard(client) {
  client.dashboard.loading = true
  client.dashboard.error   = ''
  try {
    const res = await apiFetch(`/api/professional/clients/${client.subscriberId}/dashboard`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      client.dashboard.error = data.error || data.message || 'Failed to load dashboard'
      return
    }
    client.dashboard.data = data.dashboardData ?? data
  } catch {
    client.dashboard.error = 'Network error'
  } finally {
    client.dashboard.loading = false
  }
}

async function loadSummary(client) {
  client.summary.loading = true
  client.summary.error   = ''
  client.summary.data    = null
  try {
    const params = new URLSearchParams({
      period:  client.summary.period,
      endDate: client.summary.endDate,
    })
    const res = await apiFetch(
      `/api/professional/clients/${client.subscriberId}/summary?${params}`,
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      client.summary.error = data.error || data.message || 'Failed to load summary'
      return
    }
    client.summary.data = data.summary ?? data
  } catch {
    client.summary.error = 'Network error'
  } finally {
    client.summary.loading = false
  }
}

async function loadGoals(client) {
  client.goals.loading = true
  client.goals.error   = ''
  try {
    const res = await apiFetch(`/api/professional/clients/${client.subscriberId}/goals`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      client.goals.error = data.error || data.message || 'Failed to load goals'
      return
    }
    client.goals.data = data.goals ?? data
  } catch {
    client.goals.error = 'Network error'
  } finally {
    client.goals.loading = false
  }
}

async function setGoal(client) {
  client.goalDraft.error = ''
  client.goalDraft.saving = true
  try {
    const goal = {}
    if (client.goalDraft.nutrientId != null) goal.nutrientId = client.goalDraft.nutrientId
    if (client.goalDraft.targetMin  != null) goal.targetMin  = client.goalDraft.targetMin
    if (client.goalDraft.targetMax  != null) goal.targetMax  = client.goalDraft.targetMax
    if (client.goalDraft.startDate)          goal.startDate  = client.goalDraft.startDate
    if (client.goalDraft.endDate)            goal.endDate    = client.goalDraft.endDate
    goal.notes = client.goalDraft.notes

    const res = await apiFetch(`/api/professional/clients/${client.subscriberId}/goals`, {
      method: 'POST',
      body: JSON.stringify({ goal }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      client.goalDraft.error = data.error || data.message || 'Failed to set goal'
      return
    }
    // Reset form, refresh list
    client.goalDraft = { nutrientId: null, targetMin: null, targetMax: null,
                         startDate: todayIso(), endDate: '', notes: '',
                         saving: false, error: '' }
    client.goals.data = null
    await loadGoals(client)
  } catch {
    client.goalDraft.error = 'Network error'
  } finally {
    client.goalDraft.saving = false
  }
}

async function loadMessages(client) {
  client.messages.loading = true
  client.messages.error   = ''
  try {
    const res = await apiFetch(`/api/professional/clients/${client.subscriberId}/messages`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      client.messages.error = data.error || data.message || 'Failed to load messages'
      return
    }
    client.messages.data = data.messages ?? data
  } catch {
    client.messages.error = 'Network error'
  } finally {
    client.messages.loading = false
  }
}

async function sendMessage(client) {
  const text = client.messageDraft.text.trim()
  if (!text) return
  client.messageDraft.error = ''
  client.messageDraft.sending = true
  try {
    const res = await apiFetch(`/api/professional/clients/${client.subscriberId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      client.messageDraft.error = data.error || data.message || 'Failed to send message'
      return
    }
    client.messageDraft.text = ''
    client.messages.data = null
    await loadMessages(client)
  } catch {
    client.messageDraft.error = 'Network error'
  } finally {
    client.messageDraft.sending = false
  }
}

// ---- helpers ----

function initialsFor(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?'
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function recentEntries(data) {
  return data?.recentDiaryEntries ?? data?.diaryEntries ?? data?.entries ?? []
}

function riskSnapshots(data) {
  return data?.riskSnapshots ?? data?.recentRisks ?? []
}

function goalRange(goal) {
  const min = goal.targetMin
  const max = goal.targetMax
  const unit = goal.nutrient?.unit ? ` ${goal.nutrient.unit}` : ''
  if (min != null && max != null) return `${min}–${max}${unit}`
  if (min != null) return `≥ ${min}${unit}`
  if (max != null) return `≤ ${max}${unit}`
  return ''
}

function goalSourceColor(source) {
  if (source === 'professional_defined') return '#5a9e56'
  if (source === 'user_defined')         return '#3a7fbf'
  return '#888'
}

function severityColor(level) {
  if (level === 'high')   return '#d94f4f'
  if (level === 'medium') return '#e8a820'
  return '#5a9e56'
}
</script>
