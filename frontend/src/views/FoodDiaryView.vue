<!--
  FoodDiaryView.vue — Daily food diary page
  Sections:
    • Page header with date navigation (previous / next day arrows)
    • Daily summary strip (totals + macros + progress bar)
    • Meal sections (Breakfast, Lunch, Dinner) — each shows:
        – Logged entries
        – Empty state if nothing logged
        – "Add food" panel with 3 tabs: Custom Entry / Saved Foods / From Recipes
    • Snacks & Drinks section
    • Daily notes textarea
    • Footer action buttons
-->
<template>
  <div class="container-fluid px-4 py-3">

    <!-- ============================================================
         PAGE HEADER — title + date navigator
         ============================================================ -->
    <div class="p-3 mb-3 rounded d-flex justify-content-between align-items-center"
         style="background:#e8f4e6;border:1px solid #5a9e56;">
      <div>
        <h4 style="color:#5a9e56;" class="mb-0">📓 Food Diary</h4>
        <small class="text-secondary">{{ currentDate }} — Log everything you eat and drink today</small>
      </div>

      <!-- Date navigation — arrows call prevDay() / nextDay() -->
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="prevDay">‹</button>
        <span class="border rounded px-3 py-1 bg-white small">{{ currentDate }}</span>
        <button class="btn btn-outline-secondary btn-sm" @click="nextDay">›</button>
      </div>
    </div>

    <!-- ============================================================
         DAILY SUMMARY STRIP
         ============================================================ -->
    <div class="card border mb-3 p-3">
      <div class="row g-2 align-items-center">
        <!-- Individual macro totals — populated from API once meals are logged -->
        <div class="col-auto">
          <div class="stat-label">Today's Total</div>
          <div class="stat-value">0 kcal</div>
        </div>
        <div class="col-auto">
          <div class="stat-label">Remaining</div>
          <div class="stat-value text-success">— kcal</div>
        </div>
        <div class="col-auto"><div class="stat-label">Protein</div><div class="stat-value">0g</div></div>
        <div class="col-auto"><div class="stat-label">Carbs</div><div class="stat-value">0g</div></div>
        <div class="col-auto"><div class="stat-label">Fat</div><div class="stat-value">0g</div></div>
        <div class="col-auto"><div class="stat-label">Fibre</div><div class="stat-value">0g</div></div>
        <div class="col-auto"><div class="stat-label">Sugar</div><div class="stat-value">0g</div></div>
        <div class="col ms-auto" style="max-width:220px;">
          <small class="text-muted">0% of daily kcal goal</small>
          <div class="progress mt-1" style="height:10px;">
            <div class="progress-bar" style="width:0%;background:#5a9e56;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         MEAL SECTIONS — v-for over the `meals` reactive array
         ============================================================ -->
    <div v-for="meal in meals" :key="meal.id" class="mb-4">

      <!-- Section title bar -->
      <div class="meal-section-header d-flex justify-content-between">
        <span>{{ meal.icon }} {{ meal.label.toUpperCase() }}</span>
        <span>Total: {{ meal.entries.reduce((s, e) => s + (e.kcal || 0), 0) }} kcal</span>
      </div>

      <!-- ---- Logged entries ---- -->
      <div v-for="(entry, idx) in meal.entries" :key="idx" class="diary-entry-row mt-1">

        <!-- View mode -->
        <div v-if="editingEntry?.mealId !== meal.id || editingEntry?.idx !== idx"
             class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold small">{{ entry.name }}</div>
            <div style="font-size:0.75rem;color:#666;">{{ entry.detail }}</div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="small text-muted">Carbs: {{ entry.carbs }}g</span>
            <span class="small text-muted">Protein: {{ entry.protein }}g</span>
            <span class="small text-muted">Fat: {{ entry.fat }}g</span>
            <span class="fw-bold text-success small">{{ entry.kcal }} kcal</span>
            <button class="btn btn-gf-outline btn-sm py-0 px-1" title="Edit entry"
                    @click="startEdit(meal.id, idx, entry)">✏</button>
            <button class="btn btn-sm py-0 px-1"
                    style="background:#fde8e8;border:1px solid #d99;color:#c44;"
                    title="Remove entry"
                    @click="removeEntry(meal.id, idx)">✕</button>
          </div>
        </div>

        <!-- Edit mode — inline form -->
        <div v-else class="p-2 rounded" style="background:#f0f7ef;border:1px solid #5a9e56;">
          <div class="row g-2 mb-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Food Name</label>
              <input type="text" class="form-control form-control-sm" v-model="editDraft.name">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Calories (kcal)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="editDraft.kcal">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Protein (g)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="editDraft.protein">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Carbs (g)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="editDraft.carbs">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Fat (g)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="editDraft.fat">
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-gf btn-sm" @click="saveEdit(meal.id, idx)">Save</button>
            <button class="btn btn-outline-secondary btn-sm" @click="editingEntry = null">Cancel</button>
          </div>
        </div>

      </div>

      <!-- ---- Empty state (shown when no entries logged yet) ---- -->
      <div v-if="meal.entries.length === 0"
           class="border rounded p-3 text-center text-muted my-1"
           style="border-style:dashed!important;">
        <small>Nothing logged yet for {{ meal.label.toLowerCase() }} — use the panel below to add</small>
      </div>

      <!-- ============================================================
           ADD FOOD PANEL — tabs: Custom / Saved Foods / From Recipes
           ============================================================ -->
      <div class="mt-2">
        <button class="btn btn-gf-outline btn-sm"
                @click="openPanel === meal.id ? openPanel = null : openPanel = meal.id">
          {{ openPanel === meal.id ? '▲ Close' : '＋ Add to ' + meal.label }}
        </button>
      </div>

      <div v-if="openPanel === meal.id" class="add-meal-panel mt-2">

        <!-- Tab switcher buttons -->
        <div class="d-flex gap-2 mb-3">
          <button v-for="tab in addTabs" :key="tab.id"
                  class="btn btn-sm"
                  :class="activeTab[meal.id] === tab.id ? 'btn-gf' : 'btn-gf-outline'"
                  @click="activeTab[meal.id] = tab.id">
            {{ tab.label }}
          </button>
        </div>

        <!-- ---- TAB: Custom Entry ---- -->
        <div v-if="activeTab[meal.id] === 'custom'">
          <div class="row g-2 mb-2">
            <div class="col-md-4">
              <label class="form-label form-label-sm">Food Name</label>
              <input type="text" class="form-control form-control-sm" placeholder="e.g. Porridge">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Calories (kcal)</label>
              <input type="number" class="form-control form-control-sm">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Serving Size</label>
              <input type="text" class="form-control form-control-sm" placeholder="e.g. 100g">
            </div>
          </div>
          <!-- Nutrient fields row -->
          <div class="row g-2 mb-2">
            <div class="col" v-for="nutrient in ['Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fibre (g)', 'Sugar (g)', 'Salt (g)', 'Saturates (g)']" :key="nutrient">
              <label class="form-label form-label-sm">{{ nutrient }}</label>
              <input type="number" class="form-control form-control-sm">
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-gf btn-sm">Add Entry</button>
            <!-- "Save to DB" would persist this food for future quick-adds -->
            <button class="btn btn-gf-outline btn-sm">Save to DB</button>
          </div>
        </div>

        <!-- ---- TAB: Saved Foods ---- -->
        <div v-if="activeTab[meal.id] === 'saved'">
          <input type="text" class="form-control form-control-sm mb-2"
                 placeholder="🔍 Search saved foods...">
          <!-- Loop over previously saved food items -->
          <div v-for="food in savedFoods" :key="food.name"
               class="d-flex justify-content-between align-items-center p-2 bg-white border rounded mb-1">
            <div>
              <span class="small fw-semibold">{{ food.name }}</span>
              <span class="text-muted small ms-2">{{ food.serving }}</span>
              <span class="text-muted small ms-2">{{ food.macros }}</span>
            </div>
            <div class="d-flex gap-1">
              <span class="small fw-bold me-2">{{ food.kcal }} kcal</span>
              <button class="btn btn-gf btn-sm py-0">+ Add</button>
              <button class="btn btn-gf-outline btn-sm py-0">Edit serving</button>
            </div>
          </div>
        </div>

        <!-- ---- TAB: From Recipes ---- -->
        <div v-if="activeTab[meal.id] === 'recipes'">
          <input type="text" class="form-control form-control-sm mb-2"
                 placeholder="🔍 Search recipes..."
                 v-model="recipeSearch">
          <div class="row g-2" style="max-height:340px;overflow-y:auto;">
            <div class="col-md-4" v-for="r in filteredRecipes" :key="r.id">
              <div class="card h-100">
                <img :src="r.image" :alt="r.title"
                     style="width:100%;height:90px;object-fit:cover;" />
                <div class="p-2">
                  <div class="small fw-bold">{{ r.title }}</div>
                  <div style="font-size:0.72rem;color:#666;">{{ r.kcal }} kcal · P:{{ r.protein }}g · C:{{ r.carbs }}g · F:{{ r.fat }}g</div>
                  <div style="font-size:0.72rem;color:#888;">⏱ {{ r.time }}</div>
                  <button class="btn btn-gf btn-sm w-100 mt-1"
                          style="font-size:0.72rem;"
                          @click="addRecipeToDiary(r, meal.id)">+ Add (1 serving)</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- end add-meal-panel -->
    </div><!-- end meal v-for -->

    <!-- ============================================================
         SNACKS & DRINKS
         ============================================================ -->
    <div class="mb-4">
      <div class="meal-section-header d-flex justify-content-between">
        <span>🍎 SNACKS & DRINKS</span>
        <span>Total: {{ snackEntries.reduce((s, e) => s + (e.kcal || 0), 0) }} kcal</span>
      </div>

      <!-- Logged snack entries -->
      <div v-for="(entry, idx) in snackEntries" :key="idx" class="diary-entry-row mt-1">
        <div v-if="editingSnack !== idx" class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold small">{{ entry.name }}</div>
            <div style="font-size:0.75rem;color:#666;">{{ entry.detail }}</div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="small text-muted">Carbs: {{ entry.carbs }}g</span>
            <span class="small text-muted">Protein: {{ entry.protein }}g</span>
            <span class="small text-muted">Fat: {{ entry.fat }}g</span>
            <span class="fw-bold text-success small">{{ entry.kcal }} kcal</span>
            <button class="btn btn-gf-outline btn-sm py-0 px-1" title="Edit entry"
                    @click="startEditSnack(idx, entry)">✏</button>
            <button class="btn btn-sm py-0 px-1"
                    style="background:#fde8e8;border:1px solid #d99;color:#c44;"
                    title="Remove entry"
                    @click="snackEntries.splice(idx, 1)">✕</button>
          </div>
        </div>
        <!-- Inline edit form -->
        <div v-else class="p-2 rounded" style="background:#f0f7ef;border:1px solid #5a9e56;">
          <div class="row g-2 mb-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Food Name</label>
              <input type="text" class="form-control form-control-sm" v-model="snackEditDraft.name">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Calories (kcal)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="snackEditDraft.kcal">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Protein (g)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="snackEditDraft.protein">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Carbs (g)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="snackEditDraft.carbs">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Fat (g)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="snackEditDraft.fat">
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-gf btn-sm" @click="saveSnackEdit(idx)">Save</button>
            <button class="btn btn-outline-secondary btn-sm" @click="editingSnack = null">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="snackEntries.length === 0"
           class="border rounded p-3 text-center text-muted my-1"
           style="border-style:dashed!important;">
        <small>Nothing logged yet for snacks & drinks</small>
      </div>

      <!-- Add snack toggle -->
      <div class="mt-2">
        <button class="btn btn-gf-outline btn-sm"
                @click="showSnackPanel = !showSnackPanel">
          {{ showSnackPanel ? '▲ Close' : '＋ Add Snack / Drink' }}
        </button>
      </div>

      <div v-if="showSnackPanel" class="add-meal-panel mt-2">

        <!-- Search box -->
        <div class="d-flex gap-2 mb-2">
          <input type="text" class="form-control form-control-sm"
                 placeholder="🔍 Search food or drink (e.g. banana, orange juice)..."
                 v-model="snackQuery"
                 @keyup.enter="searchSnacks">
          <button class="btn btn-gf btn-sm px-3" @click="searchSnacks" :disabled="snackLoading">
            {{ snackLoading ? '...' : 'Search' }}
          </button>
        </div>

        <!-- Error -->
        <div v-if="snackError" class="text-danger small mb-2">{{ snackError }}</div>

        <!-- Search results -->
        <div v-if="snackResults.length > 0" class="border rounded p-2 mb-2" style="background:#fff;">
          <div v-for="food in snackResults" :key="food.food_id"
               class="d-flex justify-content-between align-items-center py-1 border-bottom">
            <div>
              <span class="small fw-semibold">{{ food.food_name }}</span>
              <span v-if="food.brand_name" class="text-muted small ms-1">({{ food.brand_name }})</span>
              <div class="text-muted" style="font-size:0.72rem;">{{ food.food_description }}</div>
            </div>
            <button class="btn btn-gf btn-sm ms-2" style="white-space:nowrap;"
                    @click="selectSnackFood(food)"
                    :disabled="loadingFoodId === food.food_id">
              {{ loadingFoodId === food.food_id ? '...' : '+ Select' }}
            </button>
          </div>
        </div>

        <!-- Portion picker — shown after selecting a food -->
        <div v-if="snackPortions.length > 0"
             class="border rounded p-3 mb-2" style="background:#f0f7ef;border-color:#5a9e56!important;">
          <div class="fw-semibold small mb-2">{{ snackSelectedName }} — choose a portion:</div>
          <div v-for="(portion, pi) in snackPortions" :key="pi"
               class="d-flex justify-content-between align-items-center py-1 border-bottom">
            <div>
              <span class="small">{{ portion.description }}</span>
              <span class="text-muted small ms-2">
                {{ portion.kcal }} kcal · P:{{ portion.protein }}g · C:{{ portion.carbs }}g · F:{{ portion.fat }}g
              </span>
            </div>
            <button class="btn btn-gf btn-sm ms-2" @click="addSnackPortion(portion)">+ Add</button>
          </div>
          <button class="btn btn-outline-secondary btn-sm mt-2" @click="snackPortions = []">✕ Cancel</button>
        </div>
      </div>
    </div>

    <!-- ============================================================
         DAILY NOTES
         ============================================================ -->
    <div class="card border p-3 mb-3">
      <label class="form-label small fw-semibold">Daily Notes (optional)</label>
      <textarea class="form-control form-control-sm" rows="2"
                placeholder="How are you feeling today? Any notes about meals?"></textarea>
    </div>

    <!-- ============================================================
         FOOTER ACTIONS
         ============================================================ -->
    <div class="d-flex flex-wrap gap-2 p-3 rounded"
         style="background:#f0f7ef;border:1px solid #5a9e56;">
      <button class="btn btn-gf">Save Diary Entry</button>
      <button class="btn btn-outline-secondary">View History</button>
      <!-- Navigate to nutrition analysis for this day -->
      <RouterLink to="/nutrition" class="btn btn-outline-secondary ms-auto">
        📊 View Nutrition Analysis →
      </RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { meals, recipes, addRecipeToDiary, snackEntries } from '../diaryStore.js'

// Show today's real date
const currentDate = ref(new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))

// ---- Tab definitions for the "Add food" panel ----
const addTabs = [
  { id: 'custom',  label: '📝 Custom Entry' },
  { id: 'saved',   label: '🗄 Saved Foods'  },
  { id: 'recipes', label: '🍳 From Recipes' },
]

// ---- Which meal's add panel is open (null = all closed) ----
const openPanel = ref(null)

// ---- Active tab per meal section (keyed by meal ID) ----
const activeTab = ref({
  breakfast: 'custom',
  lunch:     'saved',
  dinner:    'recipes',
})

// ---- Saved foods — empty until user saves foods to their account ----
const savedFoods = []

// ---- Recipe search for the "From Recipes" tab ----
const recipeSearch = ref('')
const filteredRecipes = computed(() => {
  if (!recipeSearch.value) return recipes.value
  const q = recipeSearch.value.toLowerCase()
  return recipes.value.filter(r => r.title.toLowerCase().includes(q))
})

// ---- Entry editing ----
const editingEntry = ref(null)  // { mealId, idx }
const editDraft    = ref({})

function startEdit(mealId, idx, entry) {
  editingEntry.value = { mealId, idx }
  editDraft.value = { ...entry }
}

function saveEdit(mealId, idx) {
  const meal = meals.value.find(m => m.id === mealId)
  meal.entries[idx] = { ...meal.entries[idx], ...editDraft.value }
  editingEntry.value = null
}

function removeEntry(mealId, idx) {
  const meal = meals.value.find(m => m.id === mealId)
  meal.entries.splice(idx, 1)
}

// ---- Snack panel visibility ----
const showSnackPanel = ref(false)

// ---- Snack food API search ----
const snackQuery       = ref('')
const snackLoading     = ref(false)
const snackError       = ref('')
const snackResults     = ref([])
const snackPortions    = ref([])
const snackSelectedName = ref('')
const loadingFoodId    = ref(null)

// Snack edit state
const editingSnack    = ref(null)
const snackEditDraft  = ref({})

async function searchSnacks() {
  if (!snackQuery.value.trim()) return
  snackLoading.value = true
  snackError.value   = ''
  snackResults.value = []
  snackPortions.value = []
  try {
    const res  = await fetch(`/api/search?query=${encodeURIComponent(snackQuery.value)}`)
    const data = await res.json()
    const foods = data?.foods?.food
    if (!foods) { snackError.value = 'No results found.'; return }
    snackResults.value = Array.isArray(foods) ? foods : [foods]
  } catch {
    snackError.value = 'Search failed — is the backend running?'
  } finally {
    snackLoading.value = false
  }
}

async function selectSnackFood(food) {
  loadingFoodId.value = food.food_id
  snackPortions.value = []
  try {
    const res  = await fetch(`/api/search-by-id?food_id=${food.food_id}`)
    const data = await res.json()
    snackSelectedName.value = data.name
    snackPortions.value = data.portions.map(p => {
      const n = id => p.nutrients.find(x => x.nutrientId === id)?.amount ?? 0
      return {
        description: p.description,
        kcal:    n(1),
        protein: n(2),
        carbs:   n(3),
        fat:     n(4),
      }
    })
  } catch {
    snackError.value = 'Could not load food details.'
  } finally {
    loadingFoodId.value = null
  }
}

function addSnackPortion(portion) {
  snackEntries.value.push({
    name:    snackSelectedName.value,
    detail:  portion.description,
    kcal:    portion.kcal,
    protein: portion.protein,
    carbs:   portion.carbs,
    fat:     portion.fat,
  })
  snackPortions.value = []
  snackResults.value  = []
  snackQuery.value    = ''
}

function startEditSnack(idx, entry) {
  editingSnack.value   = idx
  snackEditDraft.value = { ...entry }
}

function saveSnackEdit(idx) {
  snackEntries.value[idx] = { ...snackEntries.value[idx], ...snackEditDraft.value }
  editingSnack.value = null
}

// ---- Date navigation ----
function prevDay() { /* TODO: decrement date and reload diary entries */ }
function nextDay() { /* TODO: increment date and reload diary entries */ }
</script>
