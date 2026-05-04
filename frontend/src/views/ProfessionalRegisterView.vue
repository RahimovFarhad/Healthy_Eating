<template>
  <div style="min-height:100vh;background:#f8fdf8;display:flex;flex-direction:column;">

    <div style="background:#fff;border-bottom:1px solid #d4e7d4;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;">
      <RouterLink to="/" style="color:#2e7d32;font-weight:700;font-size:1.1rem;text-decoration:none;">
        Healthy Eating
      </RouterLink>
      <RouterLink to="/" class="btn btn-sm"
                  style="background:transparent;border:1px solid #333;color:#333;border-radius:6px;padding:0.35rem 1rem;font-weight:600;">
        Back to Home
      </RouterLink>
    </div>

    <div class="container" style="max-width:960px;margin:0 auto;padding:3rem 1.5rem;flex:1;">

      <div class="row g-5 align-items-start">

        <div class="col-md-6">
          <div class="mb-3">
            <span style="background:#e8f4e6;color:#2e7d32;font-size:0.8rem;font-weight:600;padding:0.3rem 0.75rem;border-radius:20px;letter-spacing:0.05em;">
              FOR PROFESSIONALS
            </span>
          </div>
          <h1 style="font-size:2rem;font-weight:700;color:#1b4d1b;line-height:1.25;margin-bottom:1rem;">
            Join as a Nutrition Professional
          </h1>
          <p style="color:#4a7a4a;font-size:1rem;line-height:1.7;margin-bottom:1.5rem;">
            Create a professional account to manage clients, set personalised nutrition goals, monitor dietary progress, and share recipes tailored to each individual.
          </p>

          <div class="d-flex flex-column gap-3">
            <div class="d-flex align-items-start gap-3">
              <div style="width:36px;height:36px;background:#e8f4e6;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:#2e7d32;font-weight:700;font-size:0.85rem;">1</span>
              </div>
              <div>
                <div style="font-weight:600;color:#1b4d1b;font-size:0.95rem;">Manage your client roster</div>
                <div style="color:#6a8f6a;font-size:0.85rem;">Invite clients, view their diary and nutrition summaries, and track their progress over time.</div>
              </div>
            </div>
            <div class="d-flex align-items-start gap-3">
              <div style="width:36px;height:36px;background:#e8f4e6;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:#2e7d32;font-weight:700;font-size:0.85rem;">2</span>
              </div>
              <div>
                <div style="font-weight:600;color:#1b4d1b;font-size:0.95rem;">Set personalised goals</div>
                <div style="color:#6a8f6a;font-size:0.85rem;">Define nutrient targets for each client based on their individual needs and health objectives.</div>
              </div>
            </div>
            <div class="d-flex align-items-start gap-3">
              <div style="width:36px;height:36px;background:#e8f4e6;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:#2e7d32;font-weight:700;font-size:0.85rem;">3</span>
              </div>
              <div>
                <div style="font-weight:600;color:#1b4d1b;font-size:0.95rem;">Share recipes and insights</div>
                <div style="color:#6a8f6a;font-size:0.85rem;">Recommend recipes and message clients directly through the platform.</div>
              </div>
            </div>
          </div>

          <div class="mt-4" style="color:#6a8f6a;font-size:0.85rem;">
            Already have an account?
            <RouterLink to="/" style="color:#2e7d32;font-weight:600;text-decoration:none;">Log in here</RouterLink>
          </div>
        </div>

        <div class="col-md-6">
          <div style="background:#fff;border:1px solid #d4e7d4;border-radius:12px;padding:2rem;box-shadow:0 2px 12px rgba(27,77,27,0.06);">
            <h5 style="color:#1b4d1b;font-weight:700;margin-bottom:1.5rem;">Create your professional account</h5>

            <div v-if="success" class="alert alert-success small">
              Account created! You can now <RouterLink to="/">log in</RouterLink>.
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label form-label-sm" style="color:#1b4d1b;font-weight:500;">Full Name</label>
                <input type="text" class="form-control form-control-sm"
                       placeholder="e.g. Dr. Jane Smith"
                       v-model="form.name" required>
              </div>

              <div class="mb-3">
                <label class="form-label form-label-sm" style="color:#1b4d1b;font-weight:500;">Email Address</label>
                <input type="email" class="form-control form-control-sm"
                       placeholder="you@example.com"
                       v-model="form.email" required>
              </div>

              <div class="mb-3">
                <label class="form-label form-label-sm" style="color:#1b4d1b;font-weight:500;">Password</label>
                <input type="password" class="form-control form-control-sm"
                       placeholder="Min. 8 characters"
                       v-model="form.password"
                       minlength="8"
                       maxlength="72"
                       required>
              </div>

              <div v-if="error" class="alert alert-danger small py-2 mb-3">{{ error }}</div>

              <button type="submit" class="btn btn-gf w-100" :disabled="loading">
                {{ loading ? 'Creating account…' : 'Create Professional Account' }}
              </button>

              <div class="mt-3 text-center" style="font-size:0.78rem;color:#6a8f6a;">
                By registering you confirm you are a qualified nutrition professional.
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, authError } from '../auth.js'

const router = useRouter()

const form = ref({ name: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')
const success = ref(false)

function isValidEmail(email) {
  const atIndex = email.indexOf('@')
  return atIndex > 0 && email.endsWith('.com') && atIndex < email.length - 1
}

async function handleSubmit() {
  error.value = ''
  if (!isValidEmail(form.value.email)) {
    error.value = 'Please enter a valid email address'
    return
  }
  if (form.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  loading.value = true
  try {
    const ok = await register(form.value.email, form.value.name, form.value.password, true)
    if (ok) {
      router.push('/dashboard')
    } else {
      error.value = authError.value || 'Registration failed'
    }
  } finally {
    loading.value = false
  }
}
</script>
