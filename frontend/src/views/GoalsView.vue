<!--
  GoalsView.vue — Goals & progress page
  Sections:
    • Page header with "+ Add New Goal" toggle button
    • Sub-tabs: Active / Completed / Preset Library / History
    • Active goal cards (SVG progress ring + mini bar chart per goal)
    • Fibre goal (wide card with linear progress bar)
    • Collapsible "Add New Goal" section with:
        – Custom Goal form (left)
        – Preset Goal picker (right)
-->
<template>
  <div class="container-fluid px-4 py-3">

    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="p-3 mb-3 rounded d-flex justify-content-between align-items-center"
         style="background:#e8f4e6;border:1px solid #b0d4ac;">
      <div>
        <h4 style="color:#1a4a18;" class="mb-0">🎯 Goals & Progress</h4>
        <small class="text-secondary">Set personal goals, track your progress and celebrate achievements</small>
      </div>
      <!-- Toggle the add-goal section below -->
      <button class="btn btn-gf" @click="showAddForm = !showAddForm">+ Add New Goal</button>
    </div>

    <!-- ============================================================
         SUB-TABS
         ============================================================ -->
    <div class="d-flex gap-2 mb-3 border-bottom pb-2">
      <button v-for="tab in tabs" :key="tab.id"
              class="btn btn-sm"
              :class="activeTab === tab.id ? 'btn-gf' : 'btn-outline-secondary'"
              @click="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </div>

    <!-- ============================================================
         ACTIVE GOALS GRID
         ============================================================ -->
    <h6 class="fw-bold mb-3" style="color:#1a4a18;">Active Goals</h6>

    <!-- Empty state -->
    <div v-if="activeGoals.length === 0"
         class="text-center text-muted py-4 border rounded mb-4"
         style="border-style:dashed!important;">
      <p class="mb-2">No active goals yet.</p>
      <button class="btn btn-gf btn-sm" @click="showAddForm = true">+ Set your first goal</button>
    </div>

    <div class="row g-3 mb-4">

      <!-- Each active goal gets a card with a circular progress ring -->
      <div class="col-md-6" v-for="goal in activeGoals" :key="goal.id">
        <div class="goal-card">
          <div class="goal-header d-flex justify-content-between align-items-center">
            <span>{{ goal.icon }} {{ goal.title }}</span>
            <button class="btn btn-outline-secondary btn-sm py-0">Edit →</button>
          </div>
          <div class="p-3">
            <div class="d-flex align-items-center gap-3">

              <!--
                SVG circular progress ring.
                Circumference of r=40 circle = 2π×40 ≈ 251px
                stroke-dasharray = (goal.pct / 100) × 251  followed by the remainder
                The formula is: goal.pct * 2.51  (remaining = (100-pct) * 2.51)
              -->
              <svg viewBox="0 0 100 100" width="90" height="90" style="flex-shrink:0;">
                <!-- Grey background ring -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="#eee" stroke-width="10"/>
                <!-- Green progress arc -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="#5a9e56" stroke-width="10"
                        :stroke-dasharray="`${goal.pct * 2.51} ${(100 - goal.pct) * 2.51}`"
                        stroke-dashoffset="31"
                        transform="rotate(-90 50 50)"/>
                <!-- Centre percentage label -->
                <text x="50" y="46" text-anchor="middle" font-size="16" font-weight="bold" fill="#2a5a28">{{ goal.pct }}%</text>
                <text x="50" y="60" text-anchor="middle" font-size="9"  fill="#555">done</text>
              </svg>

              <!-- Goal details text -->
              <div class="flex-grow-1">
                <div class="fw-bold small">{{ goal.target }}</div>
                <div class="text-muted" style="font-size:0.75rem;">{{ goal.current }}</div>
                <div class="text-muted" style="font-size:0.75rem;">{{ goal.dates }}</div>
                <div class="text-muted" style="font-size:0.75rem;">{{ goal.setBy }}</div>
              </div>
            </div>

            <!-- Mini 7-day bar chart for this goal's daily trend -->
            <div class="mt-2 mb-1">
              <small class="text-muted">Daily trend last 7 days:</small>
              <!-- Each bar height is in px; bars over 20px get a red tint to signal a bad day -->
              <div class="d-flex align-items-end gap-1 mt-1" style="height:32px;">
                <div v-for="(h, i) in goal.trend" :key="i"
                     :style="`height:${h}px;flex:1;background:${h > 20 ? '#e8b0a0' : '#d6e8d4'};border-radius:2px 2px 0 0;border:1px solid ${h > 20 ? '#d06050' : '#7aaa76'};`">
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="d-flex flex-wrap gap-1 mt-2">
              <button class="btn btn-gf btn-sm">View Details</button>
              <button class="btn btn-gf-outline btn-sm">Mark Complete</button>
              <button class="btn btn-sm"
                      style="background:#fde8e8;border:1px solid #d99;color:#c44;">Delete Goal</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ---- Fibre goal — spans full width; uses a linear bar instead of a ring ---- -->
      <div class="col-12">
        <div class="goal-card">
          <div class="goal-header d-flex justify-content-between align-items-center">
            <span>🌿 Reach 30g Fibre Per Day (Custom Goal)</span>
            <button class="btn btn-outline-secondary btn-sm py-0">Edit →</button>
          </div>
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small>Current: 14g/day avg · Target: 30g · Progress: 47%</small>
              <small class="text-muted">47% · 16g to go per day</small>
            </div>
            <div class="progress mb-2" style="height:14px;">
              <div class="progress-bar" style="width:47%;background:#5a9e56;"></div>
            </div>
            <button class="btn btn-gf btn-sm">View Details</button>
          </div>
        </div>
      </div>

    </div>

    <!-- ============================================================
         ADD NEW GOAL SECTION (conditionally shown)
         ============================================================ -->
    <div v-if="showAddForm">
      <div class="meal-section-header">+ Add New Goal</div>
      <div class="row g-3 mt-1">

        <!-- ---- CUSTOM GOAL FORM ---- -->
        <div class="col-md-6">
          <div class="add-meal-panel">
            <h6 class="fw-bold mb-3" style="color:#2a5a28;">📝 Create Custom Goal</h6>

            <div class="mb-2">
              <label class="form-label form-label-sm">Goal Title</label>
              <input type="text" class="form-control form-control-sm" v-model="customGoal.title"
                     placeholder="e.g. Reduce sugar intake">
            </div>

            <div class="row g-2 mb-2">
              <div class="col">
                <label class="form-label form-label-sm">Goal Type</label>
                <select class="form-select form-select-sm" v-model="customGoal.type">
                  <option>Nutritional</option>
                  <option>Habit</option>
                  <option>Hydration</option>
                </select>
              </div>
              <div class="col">
                <label class="form-label form-label-sm">Nutrient / Metric</label>
                <select class="form-select form-select-sm" v-model="customGoal.metric">
                  <option>Sugar (g/day)</option>
                  <option>Calories (kcal/day)</option>
                  <option>Protein (g/day)</option>
                  <option>Fibre (g/day)</option>
                </select>
              </div>
            </div>

            <div class="row g-2 mb-2">
              <div class="col">
                <label class="form-label form-label-sm">Target Value</label>
                <input type="number" class="form-control form-control-sm" v-model="customGoal.target">
              </div>
              <div class="col">
                <label class="form-label form-label-sm">Direction</label>
                <select class="form-select form-select-sm" v-model="customGoal.direction">
                  <option>Stay Below</option>
                  <option>Reach At Least</option>
                  <option>Hit Exactly</option>
                </select>
              </div>
            </div>

            <div class="row g-2 mb-2">
              <div class="col-4">
                <label class="form-label form-label-sm">Duration</label>
                <input type="number" class="form-control form-control-sm"
                       v-model="customGoal.duration" placeholder="30">
              </div>
              <div class="col-4">
                <label class="form-label form-label-sm">&nbsp;</label>
                <select class="form-select form-select-sm">
                  <option>days</option>
                  <option>weeks</option>
                </select>
              </div>
            </div>

            <div class="mb-2">
              <label class="form-label form-label-sm">Notes (optional)</label>
              <input type="text" class="form-control form-control-sm" v-model="customGoal.notes"
                     placeholder="Any extra context for your nutritionist">
            </div>

            <!-- Checkboxes for notifications and sharing -->
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="reminder" checked>
              <label class="form-check-label form-label-sm" for="reminder">Daily reminder notification</label>
            </div>
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="share">
              <label class="form-check-label form-label-sm" for="share">Share progress with nutritionist</label>
            </div>

            <button class="btn btn-gf">Save Custom Goal</button>
          </div>
        </div>

        <!-- ---- PRESET GOALS PICKER ---- -->
        <div class="col-md-6">
          <div class="add-meal-panel">
            <h6 class="fw-bold mb-2" style="color:#2a5a28;">⭐ Choose a Preset Goal</h6>
            <p class="text-muted small mb-3">Curated goals recommended by our nutrition team</p>

            <!-- Category filter pills -->
            <div class="d-flex flex-wrap gap-1 mb-3">
              <button v-for="cat in categories" :key="cat"
                      class="btn btn-sm rounded-pill"
                      :class="activeCategory === cat ? 'btn-gf' : 'btn-gf-outline'"
                      @click="activeCategory = cat"
                      style="font-size:0.75rem;">
                {{ cat }}
              </button>
            </div>

            <!-- Preset list items -->
            <div v-for="preset in presets" :key="preset.title"
                 class="d-flex justify-content-between align-items-center p-2 bg-white border rounded mb-2">
              <div>
                <div class="fw-semibold small">{{ preset.icon }} {{ preset.title }}</div>
                <div class="text-muted" style="font-size:0.72rem;">{{ preset.desc }}</div>
                <div class="text-muted" style="font-size:0.72rem;">Duration: {{ preset.duration }}</div>
              </div>
              <button class="btn btn-gf btn-sm">+ Add</button>
            </div>

            <a href="#" class="text-success small">+ View all 40 preset goals in the library →</a>
          </div>
        </div>

      </div>
    </div><!-- end v-if showAddForm -->

  </div>
</template>

<script setup>
import { ref } from 'vue'

// ---- Page state ----
const activeTab      = ref('active')   // which tab is selected
const showAddForm    = ref(false)      // whether the add-goal section is visible
const activeCategory = ref('All')     // which category filter is active in preset picker

// ---- Tab definitions ----
const tabs = [
  { id: 'active',    label: 'Active Goals (0)' },
  { id: 'completed', label: 'Completed (7)'    },
  { id: 'presets',   label: 'Preset Library'   },
  { id: 'history',   label: 'History'          },
]

// ---- Category filter options for presets ----
const categories = ['All', 'Weight', 'Nutrition', 'Hydration', 'Habits']

// ---- Active goals data ----
// trend[] = array of bar heights (px) for the last 7 days; values > 20 = bad day (red bar)
// No active goals yet — populated once the user creates or is assigned goals
const activeGoals = ref([])

// ---- Custom goal form data (bound to the form inputs via v-model) ----
const customGoal = ref({
  title:     '',
  type:      'Nutritional',
  metric:    'Sugar (g/day)',
  target:    '',
  direction: 'Stay Below',
  duration:  30,
  notes:     '',
})

// ---- Preset goals ----
const presets = [
  {
    icon: '🔥', title: 'Meet Daily Calorie Goal',
    desc: 'Stay within your personalised calorie target each day',
    duration: '30 days'
  },
  {
    icon: '🌿', title: 'Eat 5-a-Day for 2 Weeks',
    desc: 'Log 5 portions of fruit & veg every day for 14 days',
    duration: '14 days'
  },
  {
    icon: '💧', title: 'Drink 8 Glasses of Water Daily',
    desc: 'Stay hydrated — log 8 glasses every day for 21 days',
    duration: '21 days'
  },
  {
    icon: '🥩', title: 'Hit Protein Target Every Day',
    desc: 'Reach your daily protein goal based on your profile',
    duration: '30 days'
  },
  {
    icon: '🍫', title: 'Reduce Sugar to <30g/day',
    desc: 'Cut added sugars to below 30g daily for 30 days',
    duration: '30 days'
  },
]
</script>
