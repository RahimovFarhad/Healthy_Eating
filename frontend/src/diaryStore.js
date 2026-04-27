import { ref } from 'vue'
import recipesData from './recipes.json'

export const recipes = ref(recipesData.map((r, i) => ({ id: i + 1, saved: false, ...r })))

export const meals = ref([
  { id: 'breakfast', label: 'Breakfast', entries: [] },
  { id: 'lunch', label: 'Lunch', entries: [] },
  { id: 'dinner', label: 'Dinner', entries: [] },
])

export const snackEntries = ref([])

export function addRecipeToDiary(recipe, mealId) {
  const meal = meals.value.find(m => m.id === mealId)
  if (!meal) return
  meal.entries.push({
    name: recipe.title,
    detail: `1 serving · ${recipe.cuisine}`,
    kcal: recipe.kcal,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
  })
}
