<template>
  <div class="container-fluid px-4 py-4">

    <div class="d-flex justify-content-between align-items-center mb-5">
      <div>
        <h2 class="mb-1" style="color:#1b4d1b;font-weight:600;font-size:1.75rem;">Meal Plans</h2>
        <p class="mb-0" style="color:#6b7280;font-size:0.9375rem;">Plan your meals in advance using your saved recipes</p>
      </div>
      <button class="btn fw-semibold"
              style="background:#1b4d1b;color:#fff;border:none;padding:0.625rem 1.25rem;border-radius:8px;font-size:0.875rem;"
              @click="showNewPlanForm = !showNewPlanForm">
        {{ showNewPlanForm ? 'Cancel' : '+ New Plan' }}
      </button>
    </div>

    <div v-if="showNewPlanForm" class="p-4 rounded mb-4"
         style="background:#fff;border:1.25px solid #1b4d1b;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <h6 class="fw-semibold mb-3" style="color:#1b4d1b;font-size:0.9375rem;">Create New Plan</h6>
      <div class="row g-3">
        <div class="col-sm-5">
          <label class="form-label" style="color:#374151;font-size:0.875rem;font-weight:500;">Start Date</label>
          <input type="date" class="form-control" style="border-radius:8px;font-size:0.875rem;"
                 v-model="newPlan.startDate" :min="todayIso()" />
        </div>
        <div class="col-sm-5">
          <label class="form-label" style="color:#374151;font-size:0.875rem;font-weight:500;">End Date</label>
          <input type="date" class="form-control" style="border-radius:8px;font-size:0.875rem;"
                 v-model="newPlan.endDate" :min="newPlan.startDate || todayIso()" />
        </div>
        <div class="col-sm-2 d-flex align-items-end">
          <button class="btn fw-semibold w-100"
                  style="background:#1b4d1b;color:#fff;border:none;padding:0.5rem 1rem;border-radius:8px;font-size:0.875rem;"
                  :disabled="newPlan.saving || !newPlan.startDate || !newPlan.endDate"
                  @click="handleCreatePlan">
            {{ newPlan.saving ? '…' : 'Create' }}
          </button>
        </div>
      </div>
      <div v-if="newPlan.error" class="mt-2" style="color:#d94f4f;font-size:0.875rem;">{{ newPlan.error }}</div>
    </div>

    <div v-if="plansLoading" class="text-center py-5" style="color:#9ca3af;">Loading plans…</div>
    <div v-if="plansError" class="alert alert-danger" style="border-radius:8px;">{{ plansError }}</div>

    <div v-if="!plansLoading && !plansError && plans.length === 0"
         class="text-center py-5 rounded"
         style="background:#f9fafb;border:1.5px dashed #d1d5db;border-radius:12px;">
      <div style="font-size:2rem;margin-bottom:0.75rem;">🗓</div>
      <div class="fw-semibold mb-1" style="color:#374151;font-size:1rem;">No meal plans yet</div>
      <div style="color:#6b7280;font-size:0.875rem;">Create a plan to start scheduling your meals by recipe.</div>
    </div>

    <div v-for="plan in plans" :key="plan.planId" class="mb-4">

      <div class="d-flex justify-content-between align-items-center p-3 rounded"
           :style="activePlanId === plan.planId
             ? 'background:#1b4d1b;border-radius:12px 12px 0 0;cursor:pointer;'
             : 'background:#f9fafb;border:0.75px solid #1b4d1b;border-radius:12px;cursor:pointer;'"
           @click="togglePlan(plan.planId)">
        <div class="d-flex align-items-center gap-3">
          <span class="fw-semibold"
                :style="activePlanId === plan.planId ? 'color:#fff;font-size:0.9375rem;' : 'color:#1b4d1b;font-size:0.9375rem;'">
            {{ formatPlanLabel(plan) }}
          </span>
          <span class="px-2 py-1 rounded"
                :style="activePlanId === plan.planId
                  ? 'background:rgba(255,255,255,0.2);color:#fff;font-size:0.75rem;'
                  : 'background:#e8f5e9;color:#2e7d32;font-size:0.75rem;'">
            {{ plan.planItems?.length ?? 0 }} items
          </span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm fw-semibold"
                  style="background:#fde8e8;border:1px solid #f9a8a8;color:#c44;padding:0.25rem 0.625rem;border-radius:6px;font-size:0.8125rem;"
                  @click.stop="handleDeletePlan(plan.planId)">
            Delete
          </button>
          <span :style="activePlanId === plan.planId ? 'color:#fff;font-weight:600;' : 'color:#1b4d1b;font-weight:600;'">
            {{ activePlanId === plan.planId ? '▲' : '▼' }}
          </span>
        </div>
      </div>

      <div v-if="activePlanId === plan.planId"
           class="p-4 rounded"
           style="background:#fff;border:1.25px solid #1b4d1b;border-top:none;border-radius:0 0 12px 12px;box-shadow:0 2px 6px rgba(0,0,0,0.07);">

        <div v-if="activePlanLoading" style="color:#9ca3af;font-size:0.875rem;text-align:center;padding:2rem 0;">Loading…</div>
        <div v-else-if="activePlanError" class="alert alert-danger" style="border-radius:8px;font-size:0.875rem;">{{ activePlanError }}</div>

        <div v-else-if="activePlan">

          <div class="d-flex justify-content-between align-items-center mb-4">
            <button class="btn"
                    style="background:#f3f4f6;color:#1b4d1b;border:none;padding:0.5rem 0.75rem;border-radius:8px;font-size:1rem;font-weight:600;"
                    :disabled="!canGoPrev"
                    @click="prevWeek">‹</button>
            <div class="text-center">
              <div class="fw-semibold" style="color:#1b4d1b;font-size:0.9375rem;">{{ weekRangeLabel }}</div>
              <div style="color:#9ca3af;font-size:0.75rem;">Week {{ currentWeekIndex + 1 }} of {{ totalWeeks }}</div>
            </div>
            <button class="btn"
                    style="background:#f3f4f6;color:#1b4d1b;border:none;padding:0.5rem 0.75rem;border-radius:8px;font-size:1rem;font-weight:600;"
                    :disabled="!canGoNext"
                    @click="nextWeek">›</button>
          </div>

          <div v-for="day in currentWeekDays" :key="day.date" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-semibold" style="color:#1b4d1b;font-size:0.9375rem;letter-spacing:0.02em;">
                {{ formatDayHeader(day.date) }}
              </span>
              <button v-if="dayHasItems(day)"
                      class="btn btn-sm fw-semibold"
                      style="background:#e8f5e9;color:#2e7d32;border:1px solid #a7d7a7;padding:0.25rem 0.75rem;border-radius:6px;font-size:0.8125rem;"
                      :disabled="applyingDate === day.date"
                      @click="handleLogToDay(day)">
                {{ applyingDate === day.date ? 'Logging…' : 'Log to Diary' }}
              </button>
            </div>

            <div v-for="mt in MEAL_TYPES" :key="mt.id" class="mb-2">
              <div class="p-3 rounded" style="background:#f9fafb;border:1px solid #e5e7eb;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span style="color:#6b7280;font-size:0.8125rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
                    {{ mt.label }}
                  </span>
                  <button class="btn btn-sm"
                          style="background:#e8f5e9;color:#2e7d32;border:none;padding:0.25rem 0.625rem;border-radius:6px;font-size:0.8125rem;font-weight:500;"
                          @click="openAddItem(activePlan.planId, day.date, mt.id)">
                    + Add
                  </button>
                </div>

                <div v-for="item in day[mt.id]" :key="item.planItemId"
                     class="d-flex justify-content-between align-items-center py-1 px-2 rounded mb-1"
                     style="background:#fff;border:1px solid #e5e7eb;">
                  <div>
                    <span class="fw-semibold" style="color:#1b4d1b;font-size:0.875rem;">
                      {{ item.recipe?.title ?? `Recipe #${item.recipeId}` }}
                    </span>
                    <span v-if="item.servings" style="color:#9ca3af;font-size:0.8125rem;margin-left:0.5rem;">
                      × {{ item.servings }} srv
                    </span>
                  </div>
                  <button class="btn btn-sm"
                          style="background:none;border:none;color:#9ca3af;font-size:1rem;padding:0 0.25rem;line-height:1;"
                          :disabled="removingItemId === item.planItemId"
                          @click="handleRemoveItem(activePlan.planId, item.planItemId)">
                    ×
                  </button>
                </div>

                <div v-if="addItem.show && addItem.planId === activePlan.planId && addItem.date === day.date && addItem.mealType === mt.id"
                     class="mt-2 p-3 rounded"
                     style="background:#fff;border:1.25px solid #1b4d1b;border-radius:8px;">
                  <div class="mb-2">
                    <input type="text" class="form-control form-control-sm"
                           placeholder="Search recipes…"
                           style="border-radius:6px;font-size:0.875rem;"
                           v-model="addItem.query"
                           @input="filterRecipes" />
                  </div>
                  <div v-if="recipesLoading" style="color:#9ca3af;font-size:0.8125rem;">Loading recipes…</div>
                  <div v-else-if="filteredRecipes.length === 0 && addItem.query"
                       style="color:#9ca3af;font-size:0.8125rem;">No recipes found.</div>
                  <div v-else class="mb-2" style="max-height:160px;overflow-y:auto;">
                    <div v-for="r in filteredRecipes" :key="r.recipeId"
                         class="py-1 px-2 rounded"
                         :style="addItem.recipeId === r.recipeId
                           ? 'background:#e8f5e9;color:#1b4d1b;font-size:0.875rem;cursor:pointer;margin-bottom:2px;'
                           : 'background:#f9fafb;color:#374151;font-size:0.875rem;cursor:pointer;margin-bottom:2px;'"
                         @click="selectRecipe(r)">
                      {{ r.title }}
                    </div>
                  </div>
                  <div class="d-flex gap-2 align-items-center">
                    <input type="number" class="form-control form-control-sm"
                           placeholder="Servings (optional)"
                           min="1" style="border-radius:6px;font-size:0.875rem;max-width:160px;"
                           v-model.number="addItem.servings" />
                    <button class="btn btn-sm fw-semibold"
                            style="background:#f3f4f6;color:#6b7280;border:none;padding:0.375rem 0.75rem;border-radius:6px;font-size:0.8125rem;"
                            @click="closeAddItem">Cancel</button>
                    <button class="btn btn-sm fw-semibold"
                            style="background:#1b4d1b;color:#fff;border:none;padding:0.375rem 0.75rem;border-radius:6px;font-size:0.8125rem;"
                            :disabled="!addItem.recipeId || addItem.saving"
                            @click="handleAddItem">
                      {{ addItem.saving ? '…' : 'Add' }}
                    </button>
                  </div>
                  <div v-if="addItem.error" class="mt-2" style="color:#d94f4f;font-size:0.8125rem;">{{ addItem.error }}</div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  plans, plansLoading, plansError, activePlan, activePlanLoading, activePlanError,
  recipes, recipesLoading,
  loadPlans, loadPlan, createPlan, deletePlan, addPlanItem, removePlanItem,
  loadRecipes, groupItemsByDay, formatPlanLabel, applyDayToDiary,
} from '../mealPlanStore.js'
import { viewDate } from '../diaryStore.js'

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch' },
  { id: 'dinner',    label: 'Dinner' },
  { id: 'snack',     label: 'Snack' },
]

const router = useRouter()

const showNewPlanForm = ref(false)
const activePlanId = ref(null)
const removingItemId = ref(null)
const weekOffset = ref(0)
const applyingDate = ref(null)

const newPlan = reactive({ startDate: '', endDate: '', saving: false, error: '' })

const addItem = reactive({
  show: false, planId: null, date: '', mealType: '',
  query: '', recipeId: null, recipeName: '', servings: null,
  saving: false, error: '',
})

// All days in the active plan
const allDays = computed(() => activePlan.value ? groupItemsByDay(activePlan.value) : [])

const totalWeeks = computed(() => Math.ceil(allDays.value.length / 7) || 1)

const currentWeekIndex = computed(() => Math.min(weekOffset.value, totalWeeks.value - 1))

const currentWeekDays = computed(() => {
  const start = currentWeekIndex.value * 7
  return allDays.value.slice(start, start + 7)
})

const canGoPrev = computed(() => currentWeekIndex.value > 0)
const canGoNext = computed(() => currentWeekIndex.value < totalWeeks.value - 1)

const weekRangeLabel = computed(() => {
  const days = currentWeekDays.value
  if (!days.length) return ''
  const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(days[0].date)} – ${fmt(days[days.length - 1].date)}`
})

const filteredRecipes = computed(() => {
  if (!addItem.query) return recipes.value.slice(0, 20)
  const q = addItem.query.toLowerCase()
  return recipes.value.filter(r => r.title.toLowerCase().includes(q)).slice(0, 20)
})

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatDayHeader(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function prevWeek() {
  if (canGoPrev.value) weekOffset.value--
}

function nextWeek() {
  if (canGoNext.value) weekOffset.value++
}

onMounted(() => loadPlans())

async function togglePlan(planId) {
  if (activePlanId.value === planId) {
    activePlanId.value = null
    return
  }
  activePlanId.value = planId
  weekOffset.value = 0
  closeAddItem()
  await loadPlan(planId)
  await loadRecipes()
}

async function handleCreatePlan() {
  newPlan.saving = true
  newPlan.error = ''
  try {
    const plan = await createPlan({ startDate: newPlan.startDate, endDate: newPlan.endDate })
    newPlan.startDate = ''
    newPlan.endDate = ''
    showNewPlanForm.value = false
    activePlanId.value = plan.planId
    weekOffset.value = 0
    await loadPlan(plan.planId)
    await loadRecipes()
  } catch (e) {
    newPlan.error = e.message
  } finally {
    newPlan.saving = false
  }
}

async function handleDeletePlan(planId) {
  if (!confirm('Delete this meal plan? This cannot be undone.')) return
  try {
    await deletePlan(planId)
    if (activePlanId.value === planId) activePlanId.value = null
  } catch (e) {
    alert(e.message)
  }
}

function openAddItem(planId, date, mealType) {
  addItem.show = true
  addItem.planId = planId
  addItem.date = date
  addItem.mealType = mealType
  addItem.query = ''
  addItem.recipeId = null
  addItem.recipeName = ''
  addItem.servings = null
  addItem.error = ''
}

function closeAddItem() {
  addItem.show = false
}

function selectRecipe(r) {
  addItem.recipeId = r.recipeId
  addItem.recipeName = r.title
  addItem.query = r.title
}

function filterRecipes() {
  addItem.recipeId = null
  addItem.recipeName = ''
}

async function handleAddItem() {
  addItem.saving = true
  addItem.error = ''
  try {
    await addPlanItem(addItem.planId, {
      plannedDate: addItem.date,
      mealType: addItem.mealType,
      recipeId: addItem.recipeId,
      servings: addItem.servings || null,
    })
    closeAddItem()
  } catch (e) {
    addItem.error = e.message
  } finally {
    addItem.saving = false
  }
}

function dayHasItems(day) {
  return day.breakfast.length + day.lunch.length + day.dinner.length + day.snack.length > 0
}

async function handleLogToDay(day) {
  applyingDate.value = day.date
  try {
    await applyDayToDiary(day)
    viewDate.value = new Date(day.date + 'T12:00:00')
    router.push('/diary')
  } catch (e) {
    alert(e.message)
  } finally {
    applyingDate.value = null
  }
}

async function handleRemoveItem(planId, planItemId) {
  removingItemId.value = planItemId
  try {
    await removePlanItem(planId, planItemId)
  } catch (e) {
    alert(e.message)
  } finally {
    removingItemId.value = null
  }
}
</script>
