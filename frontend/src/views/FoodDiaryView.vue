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
         style="background:#e8f4e6;border:1px solid #b0d4ac;">
      <div>
        <h4 style="color:#1a4a18;" class="mb-0">📓 Food Diary</h4>
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
        <span>Total: {{ meal.total }} kcal</span>
      </div>

      <!-- ---- Logged entries ---- -->
      <div v-for="entry in meal.entries" :key="entry.name" class="diary-entry-row mt-1">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold small">{{ entry.name }}</div>
            <!-- Serving size / detail line -->
            <div style="font-size:0.75rem;color:#666;">{{ entry.detail }}</div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="small text-muted">Carbs: {{ entry.carbs }}g</span>
            <span class="small text-muted">Protein: {{ entry.protein }}g</span>
            <span class="small text-muted">Fat: {{ entry.fat }}g</span>
            <span class="fw-bold text-success small">{{ entry.kcal }} kcal</span>
            <!-- Edit and delete buttons -->
            <button class="btn btn-gf-outline btn-sm py-0 px-1" title="Edit entry">✏</button>
            <button class="btn btn-sm py-0 px-1"
                    style="background:#fde8e8;border:1px solid #d99;color:#c44;"
                    title="Remove entry">✕</button>
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
      <div class="add-meal-panel mt-2">
        <div class="fw-bold mb-2" style="color:#2a5a28;">+ Add to {{ meal.label }}</div>

        <!-- Tab switcher buttons -->
        <div class="d-flex gap-2 mb-3">
          <button v-for="tab in addTabs" :key="tab.id"
                  class="btn btn-sm"
                  :class="activeTab[meal.id] === tab.id ? 'btn-gf' : 'btn-outline-secondary'"
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
          <div class="d-flex gap-2 mb-2">
            <input type="text" class="form-control form-control-sm"
                   placeholder="🔍 Search recipes...">
            <select class="form-select form-select-sm" style="max-width:160px;">
              <option>Ingredient filter</option>
            </select>
          </div>
          <!-- Recipe mini cards -->
          <div class="row g-2">
            <div class="col-md-4" v-for="r in suggestedRecipes" :key="r.name">
              <div class="card recipe-card">
                <div class="recipe-img-placeholder" style="height:80px;font-size:0.75rem;">[ Recipe img ]</div>
                <div class="p-2">
                  <div class="small fw-bold">{{ r.name }}</div>
                  <div style="font-size:0.72rem;color:#666;">{{ r.kcal }} kcal · P:{{ r.protein }}g · C:{{ r.carbs }}g</div>
                  <div style="font-size:0.72rem;color:#888;">⏱ {{ r.time }}</div>
                  <button class="btn btn-gf btn-sm w-100 mt-1" style="font-size:0.72rem;">Add (1 serving)</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- end add-meal-panel -->
    </div><!-- end meal v-for -->

    <!-- ============================================================
         SNACKS & DRINKS (static section)
         ============================================================ -->
    <div class="mb-4">
      <div class="meal-section-header d-flex justify-content-between" style="background:#d0d0d0;">
        <span>🍎 SNACKS & DRINKS</span>
        <span>Total: 0 kcal</span>
      </div>
      <!-- Empty snacks state -->
      <div class="border rounded p-3 text-center text-muted my-1" style="border-style:dashed!important;">
        <small>Nothing logged yet for snacks & drinks</small>
      </div>
      <button class="btn btn-gf-outline btn-sm mt-2">+ Add Snack / Drink</button>
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
         style="background:#f0f7ef;border:1px solid #b0d4ac;">
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
import { ref } from 'vue'

// Show today's real date
const currentDate = ref(new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))

// ---- Tab definitions for the "Add food" panel ----
const addTabs = [
  { id: 'custom',  label: '📝 Custom Entry' },
  { id: 'saved',   label: '🗄 Saved Foods'  },
  { id: 'recipes', label: '🍳 From Recipes' },
]

// ---- Active tab per meal section (keyed by meal ID) ----
// Each meal independently tracks which add-tab is selected
const activeTab = ref({
  breakfast: 'custom',
  lunch:     'saved',
  dinner:    'recipes',
})

// ---- Meal data — all sections start empty ----
const meals = ref([
  { id: 'breakfast', icon: '🌅', label: 'Breakfast', total: 0, entries: [] },
  { id: 'lunch',     icon: '☀️', label: 'Lunch',     total: 0, entries: [] },
  { id: 'dinner',    icon: '🌙', label: 'Dinner',    total: 0, entries: [] },
])

// ---- Saved foods — empty until user saves foods to their account ----
const savedFoods = []

// ---- Suggested recipes — empty until recipes are loaded from the API ----
const suggestedRecipes = []

// ---- Date navigation ----
// In a real app these would update `currentDate` to the previous/next actual date
function prevDay() { /* TODO: decrement date and reload diary entries */ }
function nextDay() { /* TODO: increment date and reload diary entries */ }
</script>
