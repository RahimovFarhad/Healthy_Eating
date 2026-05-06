import { ref, computed } from 'vue'
import { apiFetch } from './auth.js'
import recipesData from './recipes.json'

// static recipe data (recipes not yet wired to backend)
export const recipes = ref(recipesData.map((r, i) => ({ id: i + 1, saved: false, ...r })))

// which day the user is currently viewing
export const viewDate = ref(new Date())

export function prevDay() {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() - 1)
  viewDate.value = d
}

export function nextDay() {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() + 1)
  viewDate.value = d
}

export function isToday() {
  const now = new Date()
  const v = viewDate.value
  return (
    v.getFullYear() === now.getFullYear() &&
    v.getMonth() === now.getMonth() &&
    v.getDate() === now.getDate()
  )
}

// raw diary entries as returned by GET /diary/entries
export const diaryEntries = ref([])
export const diaryLoading = ref(false)
export const diaryError = ref('')

// daily nutrition summary from GET /diary/summary
export const dailySummary = ref(null)

function nutrientAmount(item, code) {
  const quantity = Number(item.quantity ?? 1)
  const found = item.portion?.portionNutrients?.find(pn => pn.nutrient?.code === code)
  return found ? Math.round(Number(found.amount) * quantity) : 0
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks & Drinks' },
]

// meals grouped by mealType from the raw diary entries
export const meals = computed(() =>
  MEAL_TYPES.map(mt => {
    const entries = diaryEntries.value
      .filter(e => e.mealType === mt.id)
      .flatMap(e =>
        (e.items ?? []).map(item => ({
          diaryEntryId: e.diaryEntryId,
          itemId: item.id,
          portionId: item.portionId,
          quantity: Number(item.quantity),
          name: item.portion?.foodItem?.name ?? 'Unknown food',
          detail: item.portion?.description ?? '',
          kcal: nutrientAmount(item, 'calories'),
          protein: nutrientAmount(item, 'protein'),
          carbs: nutrientAmount(item, 'carbohydrates'),
          fat: nutrientAmount(item, 'fat'),
          fibre: nutrientAmount(item, 'fibre'),
          sugar: nutrientAmount(item, 'sugar'),
          salt: nutrientAmount(item, 'salt'),
        }))
      )
    return { ...mt, entries }
  })
)

// header totals pulled from the daily summary
export const headerTotals = computed(() => {
  const nutrients = dailySummary.value?.nutrients ?? []
  const get = code => {
    const n = nutrients.find(n => n.code === code)
    return n ? Math.round(n.totalAmount) : 0
  }
  return {
    kcal: get('calories'),
    protein: get('protein'),
    carbs: get('carbohydrates'),
    fat: get('fat'),
    fibre: get('fibre'),
    sugar: get('sugar'),
    salt: get('salt'),
  }
})

// load diary entries and daily summary for the current viewDate
export async function loadDiary() {
  diaryLoading.value = true
  diaryError.value = ''
  try {
    const d = viewDate.value
    const start = new Date(d)
    start.setHours(0, 0, 0, 0)
    const end = new Date(d)
    end.setHours(23, 59, 59, 999)


    const [entriesRes, summaryRes] = await Promise.all([
      apiFetch(`/api/diary/entries?start=${start.toISOString()}&end=${end.toISOString()}`),
      apiFetch(`/api/diary/summary?period=daily&endDate=${end.toISOString()}`),
    ])

    if (entriesRes.ok) {
      const data = await entriesRes.json()
      diaryEntries.value = data.record ?? []
    } else {
      diaryError.value = 'Failed to load diary entries.'
    }

    if (summaryRes.ok) {
      const data = await summaryRes.json()
      dailySummary.value = data.summary ?? null
    }
  } catch {
    diaryError.value = 'Network error loading diary.'
  } finally {
    diaryLoading.value = false
  }
}

// the backend splits DiaryEntry from DiaryEntryItem
// this finds or creates the container before we can add items into it
async function ensureDiaryEntry(mealType) {
  const existing = diaryEntries.value.find(e => e.mealType === mealType)
  if (existing) return existing.diaryEntryId

  const d = viewDate.value
  const consumedAt = new Date(d)
  consumedAt.setHours(12, 0, 0, 0)

  const res = await apiFetch('/api/diary/entries', {
    method: 'POST',
    body: JSON.stringify({ consumedAt: consumedAt.toISOString(), mealType, items: [] }),
  })
  if (!res.ok) throw new Error('Could not create diary entry')
  const data = await res.json()
  diaryEntries.value.push(data.entry)
  return data.entry.diaryEntryId
}

// add a food found via the FatSecret api
export async function addFatSecretItem({ mealType, food_id }) {
  const diaryEntryId = await ensureDiaryEntry(mealType)
  const res = await apiFetch(`/api/diary/entries/${diaryEntryId}/items`, {
    method: 'POST',
    body: JSON.stringify({ fatSecret: { externalId: food_id }, quantity: 1 }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to add food')
  }
  await loadDiary()
}

// add a manually entered food with custom nutrition values
export async function addCustomItem({ mealType, name, kcal, protein, carbs, fat, fibre, sugar, salt, serving }) {
  const diaryEntryId = await ensureDiaryEntry(mealType)
  const res = await apiFetch(`/api/diary/entries/${diaryEntryId}/items`, {
    method: 'POST',
    body: JSON.stringify({
      quantity: 1,
      customFood: {
        name,
        brand: null,
        portions: [{
          description: serving || '1 serving',
          weight_g: null,
          nutrients: [
            { nutrientId: 1, amount: Number(kcal) || 0 },
            { nutrientId: 2, amount: Number(protein) || 0 },
            { nutrientId: 3, amount: Number(carbs) || 0 },
            { nutrientId: 4, amount: Number(fat) || 0 },
            { nutrientId: 5, amount: Number(fibre) || 0 },
            { nutrientId: 6, amount: Number(sugar) || 0 },
            { nutrientId: 7, amount: Number(salt) || 0 },
          ],
        }],
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to add custom food')
  }
  await loadDiary()
}

// add a recipe to the diary as a custom food entry using its macro values
export async function addRecipeToDiary(recipe, mealType) {
  const diaryEntryId = await ensureDiaryEntry(mealType)
  const res = await apiFetch(`/api/diary/entries/${diaryEntryId}/items`, {
    method: 'POST',
    body: JSON.stringify({
      quantity: 1,
      customFood: {
        name: recipe.title,
        brand: null,
        portions: [{
          description: '1 serving',
          weight_g: null,
          nutrients: [
            { nutrientId: 1, amount: Number(recipe.kcal) || 0 },
            { nutrientId: 2, amount: Number(recipe.protein) || 0 },
            { nutrientId: 3, amount: Number(recipe.carbs) || 0 },
            { nutrientId: 4, amount: Number(recipe.fat) || 0 },
            { nutrientId: 5, amount: Number(recipe.fibre) || 0 },
            { nutrientId: 6, amount: Number(recipe.sugars) || 0 },
            { nutrientId: 7, amount: Number(recipe.salt) || 0 },
          ],
        }],
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to add recipe to diary')
  }
  await loadDiary()
}

// update the quantity of an existing diary item
export async function updateItem({ itemId, quantity }) {
  const res = await apiFetch(`/api/diary/entry-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to update item')
  }
  await loadDiary()
}

// remove a single food item from the diary
export async function removeItem(itemId) {
  const res = await apiFetch(`/api/diary/entry-items/${itemId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to remove item')
  }
  await loadDiary()
}