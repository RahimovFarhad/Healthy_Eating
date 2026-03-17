<!--
  RecipesView.vue — Recipe library page
  Sections:
    • Hero search banner
    • Sub-tabs: All / Favourites / Recommended
    • Recipe card grid with save (heart) toggle and "View Recipe" button
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
        <!-- v-model keeps searchQuery in sync with the input -->
        <input type="text" class="form-control"
               style="max-width:500px;border:2px solid #5a9e56;"
               placeholder="🔍 Search recipes..."
               v-model="searchQuery">
        <button class="btn btn-gf px-4">Search</button>
      </div>
    </div>

    <!-- ============================================================
         SUB-TABS + RECIPE COUNT
         ============================================================ -->
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <div class="d-flex gap-2">
        <!-- Clicking a tab updates `activeTab`; filteredRecipes computed prop reacts automatically -->
        <button v-for="tab in tabs" :key="tab.id"
                class="btn btn-sm"
                :class="activeTab === tab.id ? 'btn-gf' : 'btn-outline-secondary'"
                @click="activeTab = tab.id">
          {{ tab.label }}
        </button>
      </div>
      <small class="text-muted">Showing {{ filteredRecipes.length }} recipes</small>
    </div>

    <!-- ============================================================
         RECIPE CARD GRID
         v-for over `filteredRecipes` (a computed property)
         ============================================================ -->
    <div class="row g-3 mb-4">
      <div class="col-md-4" v-for="recipe in filteredRecipes" :key="recipe.id">
        <div class="card recipe-card h-100">

          <!-- Image placeholder + overlaid badge + heart toggle -->
          <div class="recipe-img-placeholder" style="position:relative;">
            [ Food photo ]
            <!-- Colour-coded category badge (top-left) -->
            <span class="position-absolute top-0 start-0 m-2 recipe-badge text-white"
                  :style="`background:${recipe.badgeColor};`">
              {{ recipe.badge }}
            </span>
            <!-- Heart / save toggle (top-right) — @click toggles recipe.saved -->
            <span class="position-absolute top-0 end-0 m-2"
                  style="cursor:pointer;font-size:1.1rem;"
                  @click="recipe.saved = !recipe.saved"
                  :style="recipe.saved ? 'color:#d94f4f;' : 'color:#ccc;'">♥</span>
          </div>

          <!-- Card body: title, category, nutrition summary, time -->
          <div class="card-body pb-1">
            <h6 class="fw-bold mb-1">{{ recipe.title }}</h6>
            <div class="text-muted" style="font-size:0.75rem;">{{ recipe.category }} · {{ recipe.cuisine }}</div>
            <div class="small mt-1">
              {{ recipe.kcal }} kcal · P:{{ recipe.protein }}g · C:{{ recipe.carbs }}g · F:{{ recipe.fat }}g
            </div>
            <div class="text-muted" style="font-size:0.75rem;">⏱ {{ recipe.time }}</div>
          </div>

          <!-- Card footer: view & diary buttons -->
          <div class="card-footer bg-transparent border-top d-flex gap-2">
            <!-- viewRecipe() sets `selectedRecipe` and scrolls down to the detail panel -->
            <button class="btn btn-gf btn-sm flex-fill" @click="viewRecipe(recipe)">View Recipe</button>
            <button class="btn btn-gf-outline btn-sm flex-fill">+ Add to Diary</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         PAGINATION STRIP (static demo)
         ============================================================ -->
    <div class="d-flex justify-content-center gap-1 mb-4">
      <button class="btn btn-outline-secondary btn-sm">‹</button>
      <button v-for="p in 3" :key="p"
              class="btn btn-sm"
              :class="p === 1 ? 'btn-gf' : 'btn-outline-secondary'">{{ p }}</button>
      <span class="btn btn-sm disabled">…</span>
      <button class="btn btn-outline-secondary btn-sm">16</button>
      <button class="btn btn-outline-secondary btn-sm">›</button>
    </div>

    <!-- ============================================================
         RECIPE DETAIL PANEL
         Only rendered when a recipe card has been clicked (selectedRecipe !== null)
         ============================================================ -->
    <div v-if="selectedRecipe"
         class="p-4 rounded mb-4"
         style="background:#f0f7ef;border:1.5px solid #b0d4ac;">
      <h5 class="fw-bold mb-3" style="color:#2a5a28;">Recipe Detail — {{ selectedRecipe.title }}</h5>
      <div class="row g-4">

        <!-- Image + meta + action buttons -->
        <div class="col-md-3">
          <div class="recipe-img-placeholder rounded mb-2" style="height:130px;">[ Full photo ]</div>
          <div class="small text-muted mb-1">{{ selectedRecipe.cuisine }} · {{ selectedRecipe.category }}</div>
          <div class="small text-muted mb-2">{{ selectedRecipe.time }} prep</div>
          <div class="d-flex flex-wrap gap-1">
            <button class="btn btn-gf btn-sm">♥ Save</button>
            <button class="btn btn-gf-outline btn-sm">+ Add to Diary</button>
            <button class="btn btn-outline-secondary btn-sm">Tried it ✓</button>
          </div>
        </div>

        <!-- Ingredients list -->
        <div class="col-md-3">
          <h6 class="fw-bold">Ingredients (2 servings)</h6>
          <ul class="list-unstyled small">
            <li v-for="ing in selectedRecipe.ingredients" :key="ing">• {{ ing }}</li>
          </ul>
          <!-- Serving adjuster (demo only) -->
          <select class="form-select form-select-sm mt-2" style="width:160px;">
            <option>Adjust servings ▾</option>
          </select>
        </div>

        <!-- Method / steps -->
        <div class="col-md-3">
          <h6 class="fw-bold">Method</h6>
          <ol class="small ps-3">
            <li v-for="step in selectedRecipe.steps" :key="step" class="mb-1">{{ step }}</li>
          </ol>
        </div>

        <!-- Nutrition per serving -->
        <div class="col-md-3">
          <h6 class="fw-bold">Per Serving</h6>
          <div class="small">
            <div>Calories: {{ selectedRecipe.kcal }} kcal</div>
            <div>Protein: {{ selectedRecipe.protein }}g</div>
            <div>Carbs: {{ selectedRecipe.carbs }}g</div>
            <div>Fat: {{ selectedRecipe.fat }}g</div>
          </div>
        </div>

      </div>
      <!-- Close button hides the detail panel -->
      <button class="btn btn-outline-secondary btn-sm mt-3"
              @click="selectedRecipe = null">✕ Close</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ---- Search / filter state ----
const searchQuery   = ref('')
const activeTab     = ref('all')
// selectedRecipe holds the recipe currently shown in the detail panel (null = hidden)
const selectedRecipe = ref(null)

// ---- Tab definitions ----
const tabs = [
  { id: 'all', label: 'All Recipes'           },
  { id: 'fav', label: 'My Favourites ♥'       },
  { id: 'rec', label: 'Recommended for You'   },
]

// ---- Recipe data (would come from an API in production) ----
const recipes = ref([
  {
    id: 1, title: 'Baked Salmon & Roasted Veg', category: 'Dinner', cuisine: 'Mediterranean',
    kcal: 520, protein: 42, carbs: 28, fat: 22, time: '30 min',
    badge: 'High Protein', badgeColor: '#5a9e56', saved: false,
    ingredients: [
      '2 salmon fillets (150g each)', '1 courgette, sliced', '1 red pepper, sliced',
      '200g cherry tomatoes', '2 tbsp olive oil', 'Lemon, herbs, seasoning',
    ],
    steps: [
      'Preheat oven to 200°C. Arrange veg on a baking tray.',
      'Drizzle with oil, season and roast for 15 min.',
      'Place salmon on tray, roast a further 12–15 min.',
      'Squeeze lemon, garnish with herbs. Serve immediately.',
    ]
  },
  {
    id: 2, title: 'Lentil & Sweet Potato Curry', category: 'Dinner', cuisine: 'Indian',
    kcal: 380, protein: 18, carbs: 54, fat: 9, time: '40 min',
    badge: 'Vegan', badgeColor: '#6a8a6a', saved: false,
    ingredients: [
      '200g red lentils', '1 sweet potato, diced', '1 can coconut milk',
      '2 tbsp curry paste', 'Fresh coriander',
    ],
    steps: [
      'Fry curry paste for 1 min.',
      'Add lentils, sweet potato and coconut milk.',
      'Simmer 25 min until tender.',
      'Season and garnish with coriander.',
    ]
  },
  {
    id: 3, title: 'Chicken & Veg Stir-Fry', category: 'Dinner', cuisine: 'Asian',
    kcal: 460, protein: 38, carbs: 48, fat: 12, time: '20 min',
    badge: 'Quick', badgeColor: '#e8a820', saved: false,
    ingredients: [
      '300g chicken breast, sliced', 'Mixed veg (peppers, broccoli, snap peas)',
      '2 tbsp soy sauce', '1 tbsp sesame oil', 'Garlic, ginger',
    ],
    steps: [
      'Stir-fry chicken in a hot wok until cooked through.',
      'Add veg and stir-fry for 3–4 min.',
      'Add sauce ingredients and toss well.',
      'Serve with noodles or steamed rice.',
    ]
  },
  {
    id: 4, title: 'Quinoa Power Bowl', category: 'Lunch', cuisine: 'Wholefood',
    kcal: 440, protein: 22, carbs: 58, fat: 14, time: '25 min',
    badge: 'Low Calorie', badgeColor: '#6aabbc', saved: false,
    ingredients: [
      '150g quinoa', 'Roasted chickpeas', 'Avocado',
      'Cherry tomatoes', 'Tahini dressing',
    ],
    steps: [
      'Cook quinoa per packet instructions.',
      'Roast chickpeas at 200°C for 20 min.',
      'Assemble bowl with all toppings.',
      'Drizzle with tahini dressing.',
    ]
  },
  {
    id: 5, title: 'Overnight Oats & Berries', category: 'Breakfast', cuisine: 'British',
    kcal: 290, protein: 11, carbs: 46, fat: 7, time: '5 min',
    badge: 'High Fibre', badgeColor: '#5a9e56', saved: false,
    ingredients: [
      '80g rolled oats', '200ml milk of choice', '1 tbsp chia seeds',
      'Mixed berries', 'Honey to taste',
    ],
    steps: [
      'Mix oats, milk and chia seeds in a jar.',
      'Refrigerate overnight.',
      'Top with berries and a drizzle of honey before serving.',
    ]
  },
  {
    id: 6, title: 'Veggie-Loaded Frittata', category: 'Lunch', cuisine: 'Italian',
    kcal: 310, protein: 20, carbs: 14, fat: 18, time: '25 min',
    badge: 'Vegetarian', badgeColor: '#6a8a6a', saved: false,
    ingredients: [
      '6 eggs', 'Red onion, peppers, courgette', '50g feta cheese', 'Fresh herbs',
    ],
    steps: [
      'Sauté vegetables in an oven-safe pan for 5 min.',
      'Pour in beaten eggs; cook on hob for 3 min.',
      'Transfer to 180°C oven for 10–12 min until set.',
      'Slice and serve warm or cold.',
    ]
  },
])

// ---- Computed: filtered recipe list reacts to search + tab changes ----
const filteredRecipes = computed(() => {
  let result = recipes.value
  // Filter to saved favourites only
  if (activeTab.value === 'fav') result = result.filter(r => r.saved)
  // Filter by search query (case-insensitive title match)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => r.title.toLowerCase().includes(q))
  }
  return result
})

// ---- Open the detail panel for a given recipe ----
function viewRecipe(recipe) {
  selectedRecipe.value = recipe
  // Smooth-scroll to the detail panel at the bottom
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}
</script>
