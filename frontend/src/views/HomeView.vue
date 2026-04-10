<!--
  HomeView.vue — Public homepage / landing page
  Sections:
    1. Hero       — headline, tagline, CTA buttons
    2. Features   — 4 feature cards (Food Diary, Nutrition, Recipes, Pro Support)
    3. How it Works — 4-step numbered process
    4. Auth       — Login + Sign-up forms side-by-side
-->
<template>
  <div>

    <!-- ============================================================
         HERO SECTION
         ============================================================ -->
    <section class="py-5" style="background:#f0f6ef;">
      <div class="container">
        <div class="row align-items-center">

          <!-- Left: headline + CTA -->
          <div class="col-md-6">
            <h1 style="color:#5a9e56;font-weight:800;font-size:2.8rem;line-height:1.2;">
              Eat Better.<br>Feel Better.<br>Live Better.
            </h1>
            <p class="mt-3 text-secondary">
              Track your meals, get personalised nutritional advice,
              and discover healthy home-cooked recipes.
            </p>
            <!-- Scrolls down to the login/sign-up section on this same page -->
            <a href="#auth-section" class="btn btn-gf mt-3 px-4">Get Started →</a>
            <a href="#features" class="btn btn-gf-outline mt-3 ms-2 px-4">Learn More →</a>
          </div>

          <!-- Right: hero image placeholder -->
          <div class="col-md-6 mt-4 mt-md-0">
            <div class="rounded"
                 style="background:#e0e0e0;height:260px;display:flex;align-items:center;justify-content:center;color:#aaa;">
              [ Hero Image Placeholder ]
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ============================================================
         FEATURES SECTION
         ============================================================ -->
    <section id="features" class="py-5">
      <div class="container">
        <div class="section-header text-center mb-4">
          <h5>What GoodFood Offers</h5>
        </div>
        <h6 class="mb-3 fw-bold">Core Features</h6>

        <!-- v-for loops over the `features` array defined in <script setup> below -->
        <div class="row g-3">
          <div class="col-md-3" v-for="feature in features" :key="feature.title">
            <div class="card card-gf h-100"
                 style="cursor:pointer;transition:box-shadow 0.15s;"
                 @click="activeFeature = feature"
                 @mouseenter="$event.currentTarget.style.boxShadow='0 4px 16px rgba(90,158,86,0.25)'"
                 @mouseleave="$event.currentTarget.style.boxShadow=''">
              <div class="card-header">{{ feature.icon }} {{ feature.title }}</div>
              <div class="card-body">
                <ul class="list-unstyled mb-0">
                  <li v-for="item in feature.items" :key="item" class="mb-1">
                    <small>• {{ item }}</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- ---- Feature detail modal overlay ---- -->
        <Teleport to="body">
          <div v-if="activeFeature"
               style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1050;display:flex;align-items:center;justify-content:center;"
               @click.self="activeFeature = null">
            <div style="background:#fff;border-radius:12px;max-width:440px;width:90%;padding:2rem;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
              <!-- Close button -->
              <button @click="activeFeature = null"
                      style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:1.3rem;color:#999;cursor:pointer;">✕</button>
              <!-- Header -->
              <div style="font-size:2rem;margin-bottom:0.4rem;">{{ activeFeature.icon }}</div>
              <h5 class="fw-bold mb-1" style="color:#5a9e56;">{{ activeFeature.title }}</h5>
              <p class="text-muted small mb-3">{{ activeFeature.detail }}</p>
              <!-- Feature bullet list -->
              <ul class="list-unstyled mb-4">
                <li v-for="item in activeFeature.items" :key="item" class="mb-2 d-flex align-items-start gap-2">
                  <span style="color:#5a9e56;font-weight:700;">✓</span>
                  <span class="small">{{ item }}</span>
                </li>
              </ul>
              <a href="#auth-section" class="btn btn-gf w-100" @click="activeFeature = null">Get Started →</a>
            </div>
          </div>
        </Teleport>
      </div>
    </section>

    <!-- ============================================================
         HOW IT WORKS SECTION
         ============================================================ -->
    <section class="py-5" style="background:#f9f9f9;">
      <div class="container">
        <div class="section-header text-center mb-4">
          <h5>How It Works</h5>
        </div>
        <div class="row g-3 text-center">
          <!-- v-for loops over the `steps` array -->
          <div class="col-md-3" v-for="step in steps" :key="step.num">
            <div class="card h-100 border">
              <div class="card-body">
                <h5 class="fw-bold">{{ step.num }} {{ step.title }}</h5>
                <p class="text-secondary small mb-1">{{ step.desc }}</p>
                <small class="text-success fst-italic">{{ step.note }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         AUTH SECTION — Login & Sign-up forms
         ============================================================ -->
    <section id="auth-section" class="py-5">
      <div class="container">
        <div class="section-header text-center mb-4" style="background:#5a9e56;">
          <h5 class="text-white">Get Started — Log In or Create an Account</h5>
        </div>

        <div class="row g-4">

          <!-- ---- LOGIN FORM ---- -->
          <div class="col-md-6">
            <div class="card border p-4">
              <h6 class="fw-bold mb-3 border-bottom pb-2">Returning User — Log In</h6>

              <div class="mb-3">
                <label class="form-label small">Email Address</label>
                <!-- v-model two-way binds the input to loginForm.email -->
                <input type="email" class="form-control"
                       placeholder="user@example.com"
                       v-model="loginForm.email">
              </div>

              <div class="mb-2">
                <label class="form-label small">Password</label>
                <input type="password" class="form-control"
                       placeholder="••••••••"
                       v-model="loginForm.password">
              </div>

              <button class="btn btn-gf w-100 mt-3" @click="handleLogin">Log In →</button>
            </div>
          </div>

          <!-- ---- SIGN-UP FORM ---- -->
          <div class="col-md-6">
            <div class="card border p-4">
              <h6 class="fw-bold mb-3 border-bottom pb-2">New User — Create Account</h6>

              <div class="mb-3">
                <label class="form-label small">Full Name</label>
                <input type="text" class="form-control"
                       placeholder="Your name"
                       v-model="signupForm.name">
              </div>

              <div class="mb-3">
                <label class="form-label small">Email Address</label>
                <input type="email" class="form-control"
                       placeholder="user@example.com"
                       v-model="signupForm.email">
              </div>

              <div class="mb-3">
                <label class="form-label small">Password</label>
                <input type="password" class="form-control"
                       placeholder="Min. 8 characters"
                       v-model="signupForm.password">
              </div>

              <button class="btn btn-gf w-100" @click="handleSignup">Create My Account →</button>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../auth.js'

const router = useRouter()

// Form state objects — bound to inputs via v-model
const loginForm  = ref({ email: '', password: '' })
const signupForm = ref({ name: '', email: '', password: '' })

// In a real app these would call the backend API to verify credentials.
// For now they just set the auth flag and navigate to the dashboard.
function handleLogin() {
  // Use the part before @ in the email as a display name fallback
  const name = loginForm.value.email.split('@')[0]
  login(name)
  router.push('/dashboard')
}

function handleSignup() {
  login(signupForm.value.name)
  router.push('/dashboard')
}

// ---- Feature modal state ----
const activeFeature = ref(null)

// ---- Feature cards data ----
const features = [
  {
    icon: '📓', title: 'Food Diary',
    detail: 'Keep a complete record of everything you eat and drink. Log meals quickly, revisit past entries, and build healthy habits over time.',
    items: [
      'Log daily meals & snacks',
      'View historical entries',
      'Search past records',
      'Quick-add frequent foods',
    ]
  },
  {
    icon: '📊', title: 'Nutrition',
    detail: 'Get a detailed breakdown of your calorie and macronutrient intake, aligned with NHS guidelines and your personal targets.',
    items: [
      'Calorie & macro tracking',
      'Follow NHS guidelines',
      'Trend graphs & charts',
      'Weekly & monthly reports',
      'Personalised targets',
    ]
  },
  {
    icon: '🍳', title: 'Recipes',
    detail: 'Browse a curated library of healthy, home-cooked recipes. Save your favourites and add them straight to your diary.',
    items: [
      'Curated healthy recipes',
      'Save favourites',
      'Full cooking instructions',
      'Add directly to diary',
    ]
  },
  {
    icon: '👨‍⚕️', title: 'Pro Support',
    detail: 'Get paired with a registered nutritionist who can monitor your progress, set goals with you, and offer personalised guidance.',
    items: [
      'Assigned nutritionist',
      'Progress monitoring',
      'Personalised advice',
      'Direct messaging',
      'Goal setting support',
    ]
  },
]

// ---- How-it-works steps data ----
const steps = [
  { num: '①', title: 'Sign Up',      desc: 'Create your account and set your goals',      note: 'Free to join' },
  { num: '②', title: 'Log Meals',    desc: 'Record what you eat each day',                note: 'Quick & easy' },
  { num: '③', title: 'Get Insights', desc: 'View trends and nutrition feedback',           note: 'Personalised' },
  { num: '④', title: 'Improve',      desc: 'Follow advice & hit your targets',            note: 'With pro support' },
]
</script>
