import { ref } from 'vue'
import { apiFetch } from './auth.js'

export const plans = ref([])
export const plansLoading = ref(false)
export const plansError = ref('')

export const activePlan = ref(null)
export const activePlanLoading = ref(false)
export const activePlanError = ref('')

export const recipes = ref([])
export const recipesLoading = ref(false)

export async function loadPlans() {
  plansLoading.value = true
  plansError.value = ''
  try {
    const res = await apiFetch('/api/meal-plans')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { plansError.value = data.error || 'Failed to load meal plans'; return }
    plans.value = Array.isArray(data) ? data : []
  } catch {
    plansError.value = 'Network error loading meal plans.'
  } finally {
    plansLoading.value = false
  }
}

export async function loadPlan(planId) {
  activePlanLoading.value = true
  activePlanError.value = ''
  try {
    const res = await apiFetch(`/api/meal-plans/${planId}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { activePlanError.value = data.error || 'Failed to load plan'; return }
    activePlan.value = data
  } catch {
    activePlanError.value = 'Network error.'
  } finally {
    activePlanLoading.value = false
  }
}

export async function createPlan({ startDate, endDate }) {
  const res = await apiFetch('/api/meal-plans', {
    method: 'POST',
    body: JSON.stringify({ startDate, endDate, planType: 'manual' }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to create plan')
  plans.value.push(data)
  return data
}

export async function deletePlan(planId) {
  const res = await apiFetch(`/api/meal-plans/${planId}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to delete plan')
  }
  plans.value = plans.value.filter(p => p.planId !== planId)
  if (activePlan.value?.planId === planId) activePlan.value = null
}

export async function addPlanItem(planId, { plannedDate, mealType, recipeId, servings }) {
  const body = { plannedDate, mealType, recipeId }
  if (servings) body.servings = Number(servings)
  const res = await apiFetch(`/api/meal-plans/${planId}/addItem`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to add item')
  await loadPlan(planId)
}

export async function removePlanItem(planId, planItemId) {
  const res = await apiFetch(`/api/meal-plans/${planId}/items/${planItemId}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to remove item')
  }
  if (activePlan.value?.planId === planId) {
    activePlan.value = {
      ...activePlan.value,
      planItems: activePlan.value.planItems.filter(i => i.planItemId !== planItemId),
    }
  }
}

export async function loadRecipes() {
  if (recipes.value.length > 0) return
  recipesLoading.value = true
  try {
    const res = await apiFetch('/api/recipes')
    const data = await res.json().catch(() => ({}))
    if (res.ok) recipes.value = data.recipes ?? []
  } catch {
    // non-critical
  } finally {
    recipesLoading.value = false
  }
}

function toDateKey(value) {
  return new Date(value).toISOString().slice(0, 10)
}

export function groupItemsByDay(plan) {
  if (!plan) return []
  const map = {}
  for (const item of plan.planItems ?? []) {
    const day = toDateKey(item.plannedDate)
    if (!map[day]) map[day] = { breakfast: [], lunch: [], dinner: [], snack: [] }
    map[day][item.mealType].push(item)
  }
  const days = []
  const end = new Date(plan.endDate)
  const cur = new Date(plan.startDate)
  while (cur <= end) {
    const key = toDateKey(cur)
    days.push({ date: key, ...(map[key] ?? { breakfast: [], lunch: [], dinner: [], snack: [] }) })
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return days
}

export async function applyDayToDiary(day) {
  // day = { date: 'YYYY-MM-DD', breakfast: [...], lunch: [...], dinner: [...], snack: [...] }
  const allItems = [
    ...day.breakfast.map(i => ({ ...i, mealType: 'breakfast' })),
    ...day.lunch.map(i => ({ ...i, mealType: 'lunch' })),
    ...day.dinner.map(i => ({ ...i, mealType: 'dinner' })),
    ...day.snack.map(i => ({ ...i, mealType: 'snack' })),
  ]
  if (allItems.length === 0) return 0

  const start = new Date(day.date + 'T00:00:00Z').toISOString()
  const end = new Date(day.date + 'T23:59:59Z').toISOString()
  const entriesRes = await apiFetch(`/api/diary/entries?start=${start}&end=${end}`)
  const entriesData = await entriesRes.json().catch(() => ({}))
  const existingEntries = entriesData.record ?? []

  // Cache created/found entry IDs per mealType to avoid creating duplicates within one apply
  const entryIds = {}
  for (const e of existingEntries) entryIds[e.mealType] = e.diaryEntryId

  let added = 0
  for (const item of allItems) {
    if (!entryIds[item.mealType]) {
      const consumedAt = new Date(day.date + 'T12:00:00.000Z').toISOString()
      const res = await apiFetch('/api/diary/entries', {
        method: 'POST',
        body: JSON.stringify({ consumedAt, mealType: item.mealType, items: [] }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to create diary entry')
      entryIds[item.mealType] = data.entry?.diaryEntryId
    }

    const res = await apiFetch(`/api/diary/entries/${entryIds[item.mealType]}/recipe/${item.recipeId}`, {
      method: 'POST',
      body: JSON.stringify({ servings: item.servings ?? 1 }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `Failed to add recipe #${item.recipeId} to diary`)
    }
    added++
  }
  return added
}

export function formatPlanLabel(plan) {
  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(plan.startDate)} – ${fmt(plan.endDate)}`
}
