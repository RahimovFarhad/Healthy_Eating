<!--
  RecipesView.vue — Recipe library page
  Sections:
    • Hero search banner
    • Sub-tabs: All / Favourites / Recommended
    • Recipe card grid (paginated, 6 per page)
    • Pagination strip
    • Collapsible recipe detail panel (shown when a card is clicked)
-->
<template>
  <div class="container-fluid px-4 py-3">

    <!-- ============================================================
         HERO SEARCH BANNER
         ============================================================ -->
    <div class="p-4 mb-3 rounded text-center" style="background:#b8d4b8;">
      <h3 class="fw-bold text-white mb-3">🍳 Recipe Library</h3>
      <div class="d-flex justify-content-center gap-2">
        <input type="text" class="form-control"
               style="max-width:500px;border:2px solid #5a9e56;"
               placeholder="🔍 Search recipes..."
               v-model="searchQuery"
               @input="currentPage = 1">
        <button class="btn btn-gf px-4">Search</button>
      </div>
    </div>

    <!-- ============================================================
         SUB-TABS + RECIPE COUNT
         ============================================================ -->
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <div class="d-flex gap-2">
        <button v-for="tab in tabs" :key="tab.id"
                class="btn btn-sm"
                :class="activeTab === tab.id ? 'btn-gf' : 'btn-outline-secondary'"
                @click="activeTab = tab.id; currentPage = 1">
          {{ tab.label }}
        </button>
      </div>
      <small class="text-muted">Showing {{ filteredRecipes.length }} recipes</small>
    </div>

    <!-- ============================================================
         RECIPE CARD GRID
         ============================================================ -->
    <div class="row g-3 mb-4">
      <div class="col-md-4" v-for="recipe in pagedRecipes" :key="recipe.id">
        <div class="card recipe-card h-100">

          <!-- Image placeholder + overlaid badge + heart toggle -->
          <div class="recipe-img-placeholder" style="position:relative;">
            [ Food photo ]
            <span class="position-absolute top-0 start-0 m-2 recipe-badge text-white"
                  style="background:#aaa;">
              —
            </span>
            <span class="position-absolute top-0 end-0 m-2"
                  style="cursor:pointer;font-size:1.1rem;"
                  @click="recipe.saved = !recipe.saved"
                  :style="recipe.saved ? 'color:#d94f4f;' : 'color:#ccc;'">♥</span>
          </div>

          <!-- Card body -->
          <div class="card-body pb-1">
            <h6 class="fw-bold mb-1 text-muted">—</h6>
            <div class="text-muted" style="font-size:0.75rem;">— · —</div>
            <div class="small mt-1 text-muted">— kcal · P:—g · C:—g · F:—g</div>
            <div class="text-muted" style="font-size:0.75rem;">⏱ —</div>
          </div>

          <!-- Card footer -->
          <div class="card-footer bg-transparent border-top d-flex gap-2">
            <button class="btn btn-gf btn-sm flex-fill" @click="viewRecipe(recipe)">View Recipe</button>
            <button class="btn btn-gf-outline btn-sm flex-fill">+ Add to Diary</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         PAGINATION STRIP
         ============================================================ -->
    <div class="d-flex justify-content-center gap-1 mb-4">
      <!-- Previous -->
      <button class="btn btn-outline-secondary btn-sm"
              :disabled="currentPage === 1"
              @click="currentPage--">‹</button>

      <!-- Page numbers with ellipsis -->
      <template v-for="item in pageItems" :key="item">
        <span v-if="item === '...'" class="btn btn-sm disabled">…</span>
        <button v-else
                class="btn btn-sm"
                :class="item === currentPage ? 'btn-gf' : 'btn-outline-secondary'"
                @click="currentPage = item">{{ item }}</button>
      </template>

      <!-- Next -->
      <button class="btn btn-outline-secondary btn-sm"
              :disabled="currentPage === totalPages"
              @click="currentPage++">›</button>
    </div>

    <!-- ============================================================
         RECIPE DETAIL PANEL
         ============================================================ -->
    <div v-if="selectedRecipe"
         class="p-4 rounded mb-4"
         style="background:#f0f7ef;border:1.5px solid #b0d4ac;">
      <h5 class="fw-bold mb-3" style="color:#2a5a28;">Recipe Detail</h5>
      <div class="row g-4">

        <div class="col-md-3">
          <div class="recipe-img-placeholder rounded mb-2" style="height:130px;">[ Full photo ]</div>
          <div class="small text-muted mb-1">— · —</div>
          <div class="small text-muted mb-2">— prep</div>
          <div class="d-flex flex-wrap gap-1">
            <button class="btn btn-gf btn-sm">♥ Save</button>
            <button class="btn btn-gf-outline btn-sm">+ Add to Diary</button>
            <button class="btn btn-outline-secondary btn-sm">Tried it ✓</button>
          </div>
        </div>

        <div class="col-md-3">
          <h6 class="fw-bold">Ingredients</h6>
          <div class="small text-muted">No ingredients yet.</div>
        </div>

        <div class="col-md-3">
          <h6 class="fw-bold">Method</h6>
          <div class="small text-muted">No steps yet.</div>
        </div>

        <div class="col-md-3">
          <h6 class="fw-bold">Per Serving</h6>
          <div class="small text-muted">No data yet.</div>
        </div>

      </div>
      <button class="btn btn-outline-secondary btn-sm mt-3"
              @click="selectedRecipe = null">✕ Close</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const PAGE_SIZE = 6

const searchQuery    = ref('')
const activeTab      = ref('all')
const selectedRecipe = ref(null)
const currentPage    = ref(1)

const tabs = [
  { id: 'all', label: 'All Recipes'     },
  { id: 'fav', label: 'My Favourites ♥' },
]

// 48 blank placeholder entries
const recipes = ref(
  Array.from({ length: 48 }, (_, i) => ({
    id: i + 1,
    title: '',
    category: '',
    cuisine: '',
    kcal: null,
    protein: null,
    carbs: null,
    fat: null,
    time: '',
    badge: '',
    badgeColor: '#aaa',
    saved: false,
    ingredients: [],
    steps: [],
  }))
)

const filteredRecipes = computed(() => {
  let result = recipes.value
  if (activeTab.value === 'fav') result = result.filter(r => r.saved)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.title.toLowerCase().includes(q))
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecipes.value.length / PAGE_SIZE)))

const pagedRecipes = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredRecipes.value.slice(start, start + PAGE_SIZE)
})

// Builds the list of page buttons, inserting '...' where there are gaps
const pageItems = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  const items = []

  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= cur - 1 && p <= cur + 1)) {
      items.push(p)
    } else if (items[items.length - 1] !== '...') {
      items.push('...')
    }
  }
  return items
})

function viewRecipe(recipe) {
  selectedRecipe.value = recipe
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}
</script>
