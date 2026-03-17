<!--
  NutritionView.vue — Nutritional analysis page
  Sections:
    • Page header with Today / Week / Month period switcher
    • Three summary cards: calorie ring, macro donut, daily insights
    • Full nutrient breakdown table (macros + sugar/salt)
    • 7-day calorie trend bar chart
    • Micronutrients & vitamins table
-->
<template>
  <div class="container-fluid px-4 py-3">

    <!-- ============================================================
         PAGE HEADER + PERIOD SWITCHER
         ============================================================ -->
    <div class="p-3 mb-3 rounded d-flex justify-content-between align-items-center"
         style="background:#e8f4e6;border:1px solid #b0d4ac;">
      <div>
        <h4 style="color:#1a4a18;" class="mb-0">📊 Nutritional Overview</h4>
        <small class="text-secondary">Detailed breakdown of your nutritional intake</small>
      </div>
      <!-- Period buttons — clicking sets activePeriod, which could filter data in a real app -->
      <div class="d-flex gap-2">
        <button v-for="p in periods" :key="p"
                class="btn btn-sm"
                :class="activePeriod === p ? 'btn-gf' : 'btn-outline-secondary'"
                @click="activePeriod = p">
          {{ p }}
        </button>
      </div>
    </div>

    <!-- ============================================================
         SUMMARY CARDS ROW
         ============================================================ -->
    <div class="row g-4 mb-4">

      <!-- ---- CALORIE RING (SVG donut) ---- -->
      <div class="col-md-4">
        <div class="card border p-3 text-center h-100">
          <h6 class="fw-bold mb-3" style="color:#1a4a18;">Calories</h6>
          <!--
            SVG donut ring:
            r=62, circumference = 2π×62 ≈ 389
            62% eaten → stroke-dasharray = "241 148"  (241 = 0.62 × 389)
            stroke-dashoffset shifts the start to the top of the circle
          -->
          <svg viewBox="0 0 160 160" width="160" height="160" style="margin:0 auto;display:block;">
            <circle cx="80" cy="80" r="62" fill="none" stroke="#eee" stroke-width="18"/>
            <text x="80" y="76" text-anchor="middle" font-size="13" fill="#aaa">No data</text>
            <text x="80" y="92" text-anchor="middle" font-size="10" fill="#bbb">Log meals to begin</text>
          </svg>
          <div class="mt-2 text-start small text-muted">
            <div>■ Eaten: —</div>
            <div>■ Remaining: —</div>
            <div>■ Goal: 2,000 kcal</div>
          </div>
        </div>
      </div>

      <!-- ---- MACRO DONUT (three arcs stacked) ---- -->
      <div class="col-md-4">
        <div class="card border p-3 text-center h-100">
          <h6 class="fw-bold mb-3" style="color:#1a4a18;">Macronutrients</h6>
          <!--
            Three stacked arcs — each uses stroke-dashoffset to continue where the previous ended.
            Carbs: 52% → 202px  |  Protein: 31% → 120px  |  Fat: 17% → 66px
            stroke-dashoffset positions each arc immediately after the previous one.
          -->
          <svg viewBox="0 0 160 160" width="160" height="160" style="margin:0 auto;display:block;">
            <circle cx="80" cy="80" r="62" fill="none" stroke="#eee" stroke-width="18"/>
            <text x="80" y="76" text-anchor="middle" font-size="13" fill="#aaa">No data</text>
            <text x="80" y="92" text-anchor="middle" font-size="10" fill="#bbb">Log meals to begin</text>
          </svg>
          <div class="mt-2 text-start small text-muted">
            <div>■ Carbs: —</div>
            <div>■ Protein: —</div>
            <div>■ Fat: —</div>
          </div>
        </div>
      </div>

      <!-- ---- DAILY INSIGHTS ---- -->
      <div class="col-md-4">
        <div class="card border p-3 h-100">
          <h6 class="fw-bold mb-3" style="color:#1a4a18;">💡 Today's Insights</h6>
          <div class="text-muted small p-2">
            Insights will appear here once you have logged meals for the day.
          </div>
        </div>
      </div>

    </div>

    <!-- ============================================================
         FULL NUTRIENT BREAKDOWN TABLE
         ============================================================ -->
    <h6 class="fw-bold mb-2" style="color:#1a4a18;">Full Nutrient Breakdown</h6>
    <div class="table-responsive mb-4">
      <table class="table table-sm table-striped border">
        <thead style="background:#c0c0c0;color:#fff;">
          <tr>
            <th>Nutrient</th>
            <th>Eaten</th>
            <th>Target</th>
            <th>Status</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          <!-- v-for over `nutrients` array; helper functions set colour/class -->
          <tr v-for="n in nutrients" :key="n.name">
            <td class="small">{{ n.name }}</td>
            <td class="small">{{ n.eaten }}</td>
            <td class="small">{{ n.target }}</td>
            <!-- statusClass() returns .status-ok / .status-low / .status-high -->
            <td class="small" :class="statusClass(n.status)">{{ n.statusIcon }} {{ n.status }}</td>
            <td style="width:100px;">
              <div class="progress" style="height:8px;">
                <!-- statusColor() returns the matching hex colour -->
                <div class="progress-bar"
                     :style="`width:${n.pct}%;background-color:${statusColor(n.status)};`">
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ============================================================
         7-DAY CALORIE TREND BAR CHART
         ============================================================ -->
    <h6 class="fw-bold mb-3" style="color:#1a4a18;">7-Day Calorie Trend</h6>
    <div class="card border p-3 mb-4">
      <div class="d-flex align-items-end gap-2 justify-content-center"
           style="height:120px;position:relative;">
        <!-- Dashed goal line -->
        <div style="position:absolute;top:24%;left:0;right:0;border-top:1px dashed #e8a820;pointer-events:none;">
          <small style="position:absolute;right:0;top:-14px;color:#e8a820;">Goal: 2,000</small>
        </div>
        <!-- One column per day -->
        <div v-for="bar in weekBars" :key="bar.day"
             class="d-flex flex-column align-items-center" style="flex:1;max-width:80px;">
          <!-- Value label above bar -->
          <small :style="`font-size:0.65rem;color:${bar.over ? '#d94f4f' : '#2a5a28'};`">{{ bar.val }}</small>
          <!-- Bar itself — red tint if over goal, green tint otherwise -->
          <div :style="`height:${bar.height}px;background:${bar.over ? '#e8b0a0' : '#d6e8d4'};border:1px solid ${bar.over ? '#d06050' : '#7aaa76'};width:100%;border-radius:2px 2px 0 0;margin-top:auto;`">
          </div>
          <!-- Day label below bar -->
          <small style="font-size:0.65rem;color:#555;">{{ bar.day }}</small>
        </div>
      </div>
      <small class="text-muted mt-2 d-block">* Today's count is still in progress</small>
    </div>

    <!-- ============================================================
         MICRONUTRIENTS TABLE
         ============================================================ -->
    <h6 class="fw-bold mb-2" style="color:#1a4a18;">Micronutrients & Vitamins</h6>
    <div class="table-responsive">
      <table class="table table-sm table-striped border">
        <thead style="background:#c0c0c0;color:#fff;">
          <tr>
            <th>Nutrient</th>
            <th>Eaten</th>
            <th>Target</th>
            <th>Progress</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in micros" :key="m.name">
            <td class="small">{{ m.name }}</td>
            <td class="small">{{ m.eaten }}</td>
            <td class="small">{{ m.target }}</td>
            <td style="width:130px;">
              <div class="progress" style="height:8px;">
                <div class="progress-bar"
                     :style="`width:${m.pct}%;background-color:${statusColor(m.status)};`">
                </div>
              </div>
            </td>
            <td class="small" :class="statusClass(m.status)">{{ m.status }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Would expand to show all tracked micronutrients in a real app -->
      <a href="#" class="text-success small">+ Show all 20 micronutrients ▾</a>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// ---- Period switcher state ----
const periods = ['Today', 'Week', 'Month']
const activePeriod = ref('Today')   // reactive — controls which period tab looks "active"

// ---- Nutrient table — targets populated from NHS guidelines; eaten values come from the API ----
const nutrients = [
  { name: 'Calories',        eaten: '—',   target: '2,000',   status: '—', statusIcon: '', pct: 0 },
  { name: 'Protein',         eaten: '—',   target: '55g',     status: '—', statusIcon: '', pct: 0 },
  { name: 'Carbohydrates',   eaten: '—',   target: '260g',    status: '—', statusIcon: '', pct: 0 },
  { name: 'Of which Sugars', eaten: '—',   target: '30g max', status: '—', statusIcon: '', pct: 0 },
  { name: 'Fat (total)',     eaten: '—',   target: '70g',     status: '—', statusIcon: '', pct: 0 },
  { name: 'Saturated Fat',   eaten: '—',   target: '20g max', status: '—', statusIcon: '', pct: 0 },
  { name: 'Fibre',           eaten: '—',   target: '30g',     status: '—', statusIcon: '', pct: 0 },
  { name: 'Salt (Sodium)',   eaten: '—',   target: '6g max',  status: '—', statusIcon: '', pct: 0 },
]

// ---- 7-day chart — no data yet ----
const weekBars = [
  { day: 'Mon', val: '—', height: 0, over: false },
  { day: 'Tue', val: '—', height: 0, over: false },
  { day: 'Wed', val: '—', height: 0, over: false },
  { day: 'Thu', val: '—', height: 0, over: false },
  { day: 'Fri', val: '—', height: 0, over: false },
  { day: 'Sat', val: '—', height: 0, over: false },
  { day: 'Today', val: '—', height: 0, over: false },
]

// ---- Micronutrients — no data yet ----
const micros = [
  { name: 'Vitamin C', eaten: '—', target: '80mg',   pct: 0, status: '—' },
  { name: 'Vitamin D', eaten: '—', target: '10μg',   pct: 0, status: '—' },
  { name: 'Iron',      eaten: '—', target: '14.8mg', pct: 0, status: '—' },
  { name: 'Calcium',   eaten: '—', target: '700mg',  pct: 0, status: '—' },
]

// ---- Helper: CSS class for status text colour ----
function statusClass(s) {
  if (s === 'OK' || s === 'Good')      return 'status-ok'    // green
  if (s === 'Low' || s === 'Very Low') return 'status-low'   // amber
  if (s === 'High')                    return 'status-high'  // red
  return ''
}

// ---- Helper: hex colour for progress bars ----
function statusColor(s) {
  if (s === 'OK' || s === 'Good')      return '#5a9e56'
  if (s === 'Low' || s === 'Very Low') return '#e8a820'
  if (s === 'High')                    return '#d94f4f'
  return '#ccc'
}
</script>
