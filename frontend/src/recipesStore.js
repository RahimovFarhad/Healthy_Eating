import { ref } from 'vue'
import { apiFetch } from './auth.js'

// favourited recipes
export const favourites = ref([])
export const loadingFavs = ref(false)
export const favsError = ref('')

// load all favourited recipes for the current user
export async function loadFavourites() {
  loadingFavs.value = true
  favsError.value = ''
  try {
    const res = await apiFetch('/api/recipes/favorites')
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      favourites.value = data.recipes ?? []
    } else {
      favsError.value = data.message || data.error || 'Failed to load favourites'
    }
  } catch (err) {
    favsError.value = 'Network error loading favourites'
    console.error('Favourites load error:', err)
  } finally {
    loadingFavs.value = false
  }
}

// toggle favourite status for a recipe
export async function toggleFavourite(recipeId) {
  try {
    const res = await apiFetch(`/api/recipes/${recipeId}/favorites`, {
      method: 'POST',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to toggle favourite')
    }
    const data = await res.json()
    
    // update local state based on the response
    if (data.favorite?.favorited) {
      // recipe was added to favourites - reload to get full recipe data
      await loadFavourites()
    } else {
      // recipe was removed from favourites
      favourites.value = favourites.value.filter(r => r.recipeId !== recipeId)
    }
    
    return data.favorite?.favorited
  } catch (err) {
    console.error('Toggle favourite error:', err)
    throw err
  }
}
