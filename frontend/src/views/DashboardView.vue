<!--
  DashboardView.vue — Main authenticated overview page
  Sections:
    • Welcome banner with date and quick "Log Meal" CTA
    • Quick-stats strip (calories, water, meals logged, streak)
    • Row 1: Food Diary card + Nutritional Overview card
    • Row 2: Recipes card + Professional Support card + Goals card
    • Recommended Recipes strip at the bottom
-->
<template>
  <div class="container-fluid px-4 py-3">

    <!-- ============================================================
         WELCOME BANNER
         ============================================================ -->
    <div class="d-flex justify-content-between align-items-center p-3 mb-3 rounded"
         style="background:#e8f4e6;border:1px solid #5a9e56;">
      <div>
        <h4 style="color:#5a9e56;" class="mb-0">Welcome 🌿</h4>
        <small class="text-secondary">Here's your health summary for today — {{ today }}</small>
      </div>
      <!-- Quick shortcut to the Food Diary -->
      <RouterLink to="/diary" class="btn btn-gf btn-sm">+ Log Meal</RouterLink>
    </div>

    <div v-if="error" class="alert alert-danger small">{{ error }}</div>

    <!-- ============================================================
         QUICK STATS STRIP
         v-for loops over `quickStats` array to render each tile
         ============================================================ -->
    <div class="row g-3 mb-4">
      <!-- Calories -->
      <div class="col-6 col-md-3">
        <div class="stat-card h-100">
          <div class="stat-label">🔥 Calories Today</div>
          <div class="stat-value">
            <span v-if="loading">…</span>
            <span v-else-if="caloriesToday != null">{{ Math.round(caloriesToday) }} kcal</span>
            <span v-else>— kcal</span>
          </div>
        </div>
      </div>

      <!-- Water intake — interactive +/- tile -->
      <div class="col-6 col-md-3">
        <div class="stat-card h-100">
          <div class="stat-label">💧 Water Intake</div>
          <div class="stat-value mb-1">{{ waterGlasses }} / 8</div>
          <div class="d-flex align-items-center justify-content-between gap-1">
            <button class="btn btn-sm btn-gf-outline px-2 py-0"
                    @click="waterGlasses > 0 && waterGlasses--"
                    :disabled="waterGlasses === 0">−</button>
            <span style="font-size:0.7rem;">
              <span v-for="n in 8" :key="n">{{ n <= waterGlasses ? '💧' : '○' }}</span>
            </span>
            <button class="btn btn-sm btn-gf px-2 py-0"
                    @click="waterGlasses < 8 && waterGlasses++"
                    :disabled="waterGlasses === 8">+</button>
          </div>
        </div>
      </div>

      <!-- Meals logged -->
      <div class="col-6 col-md-3">
        <div class="stat-card h-100">
          <div class="stat-label">🥗 Meals Logged</div>
          <div class="stat-value">
            <span v-if="loading">…</span>
            <span v-else>{{ mealsLoggedToday ?? 0 }} today</span>
          </div>
        </div>
      </div>

      <!-- Days logged -->
      <div class="col-6 col-md-3">
        <div class="stat-card h-100">
          <div class="stat-label">📅 Days Logged</div>
          <div class="stat-value">
            <span v-if="loading">…</span>
            <span v-else>{{ daysLogged ?? 0 }} days</span>
          </div>
        </div>
      </div>
    </div>

    <h5 class="fw-bold mb-3" style="color:#5a9e56;">Your Overview</h5>

    <!-- ============================================================
         ROW 1: Food Diary card + Nutritional Overview card
         ============================================================ -->
    <div class="row g-3 mb-3">

      <!-- ---- FOOD DIARY CARD ---- -->
      <div class="col-md-6">
        <div class="card card-gf h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>📓 Food Diary</span>
            <RouterLink to="/diary" class="btn btn-gf btn-sm">View All</RouterLink>
          </div>
          <div class="card-body p-0">

            <!-- Loading -->
            <div v-if="loading" class="p-3 text-center text-muted">
              <small>Loading…</small>
            </div>

            <!-- Logged meals -->
            <ul v-else-if="foodDiaryPreview.length > 0" class="list-unstyled mb-0 p-3">
              <li v-for="entry in foodDiaryPreview" :key="entry.diaryEntryId"
                  class="d-flex justify-content-between align-items-center pb-1 mb-1 border-bottom">
                <span class="small">
                  {{ mealIcons[entry.mealType] ?? '🍽' }}
                  <span class="fw-semibold text-capitalize">{{ entry.mealType }}</span>
                </span>
                <span class="text-muted" style="font-size:0.75rem;">
                  {{ entry.items?.length ?? 0 }}
                  {{ (entry.items?.length ?? 0) === 1 ? 'item' : 'items' }}
                </span>
              </li>
            </ul>

            <!-- Empty state -->
            <div v-else class="p-3 text-center text-muted">
              <small>No meals logged today yet.</small><br>
              <RouterLink to="/diary" class="btn btn-gf btn-sm mt-2">+ Log your first meal</RouterLink>
            </div>
          </div>

          <div class="card-footer text-center border-0 bg-transparent">
            <RouterLink to="/diary" class="text-success small fw-bold">↓ Click to open Food Diary</RouterLink>
          </div>
        </div>
      </div>

      <!-- ---- NUTRITIONAL OVERVIEW CARD ---- -->
      <div class="col-md-6">
        <div class="card card-gf h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>📊 Nutritional Overview</span>
            <RouterLink to="/nutrition" class="btn btn-gf btn-sm">Details</RouterLink>
          </div>
          <div class="card-body">

            <!-- Loading -->
            <div v-if="loading" class="p-3 text-center text-muted">
              <small>Loading…</small>
            </div>

            <!-- Nutrient breakdown -->
            <ul v-else-if="nutritionPreview.length > 0" class="list-unstyled mb-0">
              <li v-for="n in nutritionPreview" :key="n.code"
                  class="d-flex justify-content-between align-items-center pb-1 mb-1 border-bottom">
                <span class="small">{{ nutrientLabels[n.code] ?? n.name ?? n.code }}</span>
                <span class="fw-semibold small">{{ formatAmount(n) }}</span>
              </li>
            </ul>

            <!-- Empty state -->
            <div v-else class="p-3 text-center text-muted">
              <small>No data yet. Log meals in the Food Diary to see your nutrition breakdown.</small><br>
              <RouterLink to="/diary" class="btn btn-gf-outline btn-sm mt-2">Go to Food Diary</RouterLink>
            </div>
          </div>

          <div class="card-footer text-center border-0 bg-transparent">
            <RouterLink to="/nutrition" class="text-success small fw-bold">↓ Click to open Nutrition Overview</RouterLink>
          </div>
        </div>
      </div>

    </div>

    <!-- ============================================================
         ROW 2: Recipes card + Professional Support card + Goals card
         ============================================================ -->
    <div class="row g-3 mb-4">

      <!-- ---- RECIPES CARD ---- -->
      <div class="col-md-4">
        <div class="card card-gf h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>🍳 Recipes</span>
            <RouterLink to="/recipes" class="btn btn-gf btn-sm">Browse</RouterLink>
          </div>
          <div class="card-body p-3 text-center text-muted">
            <small>Browse the recipe library to save favourites.</small><br>
            <RouterLink to="/recipes" class="btn btn-gf-outline btn-sm mt-2">Browse Recipes</RouterLink>
          </div>
          <div class="card-footer text-center border-0 bg-transparent">
            <RouterLink to="/recipes" class="text-success small fw-bold">↓ Click to open Recipes</RouterLink>
          </div>
        </div>
      </div>

      <!-- ---- PROFESSIONAL SUPPORT CARD ---- -->
      <div class="col-md-4">
        <div class="card card-gf h-100">
          <div class="card-header">👨‍⚕️ Professional Support</div>
          <div class="card-body text-center text-muted p-3">
            <small>No professional assigned yet. Messages will appear here once a nutritionist is linked to your account.</small><br>
            <RouterLink to="/messages" class="btn btn-gf-outline btn-sm mt-2">Go to Messages</RouterLink>
          </div>
          <div class="card-footer text-center border-0 bg-transparent">
            <RouterLink to="/messages" class="text-success small fw-bold">↓ Click to open Messages</RouterLink>
          </div>
        </div>
      </div>

      <!-- ---- GOALS CARD ---- -->
      <div class="col-md-4">
        <div class="card card-gf h-100">
          <div class="card-header">🎯 Goals & Progress</div>
          <div class="card-body text-center text-muted p-3">
            <small>No active goals yet.</small><br>
            <RouterLink to="/goals" class="btn btn-gf-outline btn-sm mt-2">Set a Goal</RouterLink>
          </div>
          <div class="card-footer text-center border-0 bg-transparent">
            <RouterLink to="/goals" class="text-success small fw-bold">↓ Click to open Goals</RouterLink>
          </div>
        </div>
      </div>

    </div>

    <!-- ============================================================
         RECOMMENDED RECIPES STRIP
         ============================================================ -->
    <div class="section-header mb-3">
      <h5 class="text-center">Recommended for You</h5>
    </div>
    <div class="text-center text-muted py-4">
      <small>Recommended recipes will appear here once you've set up your profile and goals.</small><br>
      <RouterLink to="/recipes" class="btn btn-gf btn-sm mt-2">Browse All Recipes</RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../auth.js'

const waterGlasses = ref(0)
const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const dashboard = ref(null)
const loading   = ref(true)
const error     = ref('')

onMounted(async () => {
  try {
    const res = await apiFetch('/api/diary/dashboard')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.message || data.error || 'Failed to load dashboard'
      return
    }
    dashboard.value = data.dashboardData ?? data
  } catch {
    error.value = 'Network error — could not load dashboard'
  } finally {
    loading.value = false
  }
})

const quickStats        = computed(() => dashboard.value?.quickStats ?? {})
const foodDiaryPreview  = computed(() => dashboard.value?.foodDiaryPreview ?? [])
const nutritionPreview  = computed(() => dashboard.value?.nutritionPreview ?? [])

const caloriesToday   = computed(() => quickStats.value.calories_today ?? null)
const mealsLoggedToday = computed(() => quickStats.value.meals_logged_today ?? null)
const daysLogged      = computed(() => quickStats.value.days_logged ?? null)

const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

const nutrientLabels = {
  protein:       'Protein',
  carbohydrates: 'Carbs',
  fat:           'Fat',
  fibre:         'Fibre',
}

function formatAmount(n) {
  const value = Number(n.totalAmount ?? 0)
  const unit = n.unit ?? 'g'
  return `${Math.round(value)}${unit}`
}
</script>
