import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Public routes that don't require authentication
const publicRoutes = [
  { path: '/',                          name: 'Home' },
  { path: '/register/professional',     name: 'Professional Register' },
  { path: '/verify-email',              name: 'Verify Email' },
  { path: '/verify-email/professional', name: 'Verify Email (Professional)' },
  { path: '/nonexistent-page',          name: '404 Not Found' },
]

// Authenticated routes — tested with a mocked subscriber auth token.
// The tests check for WCAG 2.1 AA violations in the rendered markup; they do not
// exercise backend API calls (those fail gracefully and the page still renders).
const authenticatedRoutes = [
  { path: '/dashboard',  name: 'Dashboard' },
  { path: '/diary',      name: 'Food Diary' },
  { path: '/nutrition',  name: 'Nutrition' },
  { path: '/meal-plans', name: 'Meal Plan' },
  { path: '/goals',      name: 'Goals' },
  { path: '/recipes',    name: 'Recipes' },
  { path: '/messages',   name: 'Messages' },
  { path: '/profile',    name: 'Profile' },
]

function fakeTokenForRole(role = 'subscriber') {
  const payload = Buffer.from(JSON.stringify({
    userId: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    role,
    exp: 9999999999,
  })).toString('base64url')

  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.fake-sig`
}

async function mockApi(page, role = null) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())

    if (url.pathname === '/api/auth/refresh' && role) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: fakeTokenForRole(role) }),
      })
      return
    }

    if (url.pathname === '/api/auth/refresh') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No refresh token' }),
      })
      return
    }

    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'API unavailable in accessibility tests' }),
    })
  })
}

for (const route of publicRoutes) {
  test(`${route.name} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await mockApi(page)
    await page.goto(route.path)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}

for (const route of authenticatedRoutes) {
  test(`${route.name} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await mockApi(page, 'subscriber')
    await page.goto(route.path)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}

// Professional dashboard requires a professional-role token
test('Professional Dashboard has no WCAG 2.1 AA violations', async ({ page }) => {
  await mockApi(page, 'professional')
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(results.violations).toEqual([])
})
