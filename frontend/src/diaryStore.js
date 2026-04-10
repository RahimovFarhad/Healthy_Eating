// diaryStore.js — shared state between RecipesView and FoodDiaryView
import { ref } from 'vue'
import recipesData from './recipes.json'

// All recipes, with id and saved flag added
export const recipes = ref(recipesData.map((r, i) => ({ id: i + 1, saved: false, ...r })))

// Diary meals — each has an entries array that both views can push to
export const meals = ref([
  { id: 'breakfast', icon: '🌅', label: 'Breakfast', entries: [] },
  { id: 'lunch',     icon: '☀️', label: 'Lunch',     entries: [] },
  { id: 'dinner',    icon: '🌙', label: 'Dinner',    entries: [] },
])

// Snacks & drinks entries — populated via food API search
export const snackEntries = ref([])

// Add a recipe to a meal as a diary entry
export function addRecipeToDiary(recipe, mealId) {
  const meal = meals.value.find(m => m.id === mealId)
  if (!meal) return
  meal.entries.push({
    name:    recipe.title,
    detail:  `1 serving · ${recipe.cuisine}`,
    kcal:    recipe.kcal,
    protein: recipe.protein,
    carbs:   recipe.carbs,
    fat:     recipe.fat,
  })
}
