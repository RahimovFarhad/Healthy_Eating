<template>
  <div>

    <section class="py-5" style="background:#f0f6ef;">
      <div class="container">
        <div class="row align-items-center">

          <div class="col-md-6">
            <h1 style="color:#5a9e56;font-weight:800;font-size:2.8rem;line-height:1.2;">
              Eat Better.<br>Feel Better.<br>Live Better.
            </h1>
            <p class="mt-3 text-secondary">
              Track your meals, get personalised nutritional advice,
              and discover healthy home-cooked recipes.
            </p>
            <a href="#auth-section" class="btn btn-gf mt-3 px-4">Get Started →</a>
            <a href="#features" class="btn btn-gf-outline mt-3 ms-2 px-4">Learn More →</a>
          </div>

          <div class="col-md-6 mt-4 mt-md-0">
            <div class="rounded"
                 style="background:#e0e0e0;height:260px;display:flex;align-items:center;justify-content:center;color:#aaa;">
              [ Hero Image Placeholder ]
            </div>
          </div>

        </div>
      </div>
    </section>

    <section id="features" class="py-5">
      <div class="container">
        <div class="section-header text-center mb-4">
          <h5>What GoodFood Offers</h5>
        </div>
        <h6 class="mb-3 fw-bold">Core Features</h6>

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

        <Teleport to="body">
          <div v-if="activeFeature"
               style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1050;display:flex;align-items:center;justify-content:center;"
               @click.self="activeFeature = null">
            <div style="background:#fff;border-radius:12px;max-width:440px;width:90%;padding:2rem;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
              <button @click="activeFeature = null"
                      style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:1.3rem;color:#999;cursor:pointer;">✕</button>
              <div style="font-size:2rem;margin-bottom:0.4rem;">{{ activeFeature.icon }}</div>
              <h5 class="fw-bold mb-1" style="color:#5a9e56;">{{ activeFeature.title }}</h5>
              <p class="text-muted small mb-3">{{ activeFeature.detail }}</p>
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

    <section class="py-5" style="background:#f9f9f9;">
      <div class="container">
        <div class="section-header text-center mb-4">
          <h5>How It Works</h5>
        </div>
        <div class="row g-3 text-center">
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

    <section id="auth-section" class="py-5">
      <div class="container">
        <div class="section-header text-center mb-4" style="background:#5a9e56;">
          <h5 class="text-white">Get Started — Log In or Create an Account</h5>
        </div>

        <div class="row g-4">

          <div class="col-md-6">
            <div class="card border p-4">
              <h6 class="fw-bold mb-3 border-bottom pb-2">Returning User — Log In</h6>

              <div class="mb-3">
                <label class="form-label small">Email Address</label>
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

              <div v-if="loginError" class="alert alert-danger py-2 small mt-2 mb-0">{{ loginError }}</div>

              <button class="btn btn-gf w-100 mt-3" @click="handleLogin" :disabled="loginLoading">
                <span v-if="loginLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                Log In →
              </button>
            </div>
          </div>

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

              <div v-if="signupError"   class="alert alert-danger py-2 small mb-2">{{ signupError }}</div>
              <div v-if="signupSuccess" class="alert alert-success py-2 small mb-2">{{ signupSuccess }}</div>

              <button class="btn btn-gf w-100" @click="handleSignup" :disabled="signupLoading">
                <span v-if="signupLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                Create My Account →
              </button>
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
import { login, register } from '../auth.js'

const router = useRouter()

const loginForm  = ref({ email: '', password: '' })
const signupForm = ref({ name: '', email: '', password: '' })

const loginLoading  = ref(false)
const loginError    = ref('')
const signupLoading = ref(false)
const signupError   = ref('')
const signupSuccess = ref('')

async function handleLogin() {
  loginError.value   = ''
  loginLoading.value = true
  try {
    const ok = await login(loginForm.value.email, loginForm.value.password)
    if (ok) {
      router.push('/dashboard')
    } else {
      const { authError } = await import('../auth.js')
      loginError.value = authError.value || 'Login failed'
    }
  } finally {
    loginLoading.value = false
  }
}

async function handleSignup() {
  signupError.value   = ''
  signupSuccess.value = ''
  signupLoading.value = true
  try {
    const ok = await register(signupForm.value.email, signupForm.value.name, signupForm.value.password)
    if (ok) {
      signupSuccess.value = 'Account created! You can now log in.'
      signupForm.value = { name: '', email: '', password: '' }
    } else {
      const { authError } = await import('../auth.js')
      signupError.value = authError.value || 'Registration failed'
    }
  } finally {
    signupLoading.value = false
  }
}

const activeFeature = ref(null)

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

const steps = [
  { num: '①', title: 'Sign Up',      desc: 'Create your account and set your goals',      note: 'Free to join' },
  { num: '②', title: 'Log Meals',    desc: 'Record what you eat each day',                note: 'Quick & easy' },
  { num: '③', title: 'Get Insights', desc: 'View trends and nutrition feedback',           note: 'Personalised' },
  { num: '④', title: 'Improve',      desc: 'Follow advice & hit your targets',            note: 'With pro support' },
]
</script>
