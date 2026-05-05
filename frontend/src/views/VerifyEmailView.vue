<template>
  <div style="min-height:100vh;background:#f8fdf8;display:flex;flex-direction:column;">

    <div style="background:#fff;border-bottom:1px solid #d4e7d4;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;">
      <RouterLink to="/" style="color:#2e7d32;font-weight:700;font-size:1.1rem;text-decoration:none;">
        Healthy Eating
      </RouterLink>
    </div>

    <div class="container" style="max-width:500px;margin:0 auto;padding:3rem 1.5rem;flex:1;display:flex;align-items:center;">
      <div style="background:#fff;border:1px solid #d4e7d4;border-radius:12px;padding:2.5rem;box-shadow:0 2px 12px rgba(27,77,27,0.06);width:100%;">
        
        <div class="text-center mb-4">
          <div style="width:60px;height:60px;background:#e8f4e6;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
            <span style="color:#2e7d32;font-size:1.8rem;">✉</span>
          </div>
          <h5 style="color:#1b4d1b;font-weight:700;margin-bottom:0.5rem;">Verify Your Email</h5>
          <p style="color:#6a8f6a;font-size:0.9rem;margin:0;">
            We sent a 6-digit code to<br>
            <strong style="color:#2e7d32;">{{ email }}</strong>
          </p>
        </div>

        <div v-if="error" class="alert alert-danger small py-2 mb-3">{{ error }}</div>
        <div v-if="success" class="alert alert-success small py-2 mb-3">{{ success }}</div>

        <form @submit.prevent="handleVerify">
          <div class="mb-3">
            <label class="form-label form-label-sm" style="color:#1b4d1b;font-weight:500;">Verification Code</label>
            <input 
              type="text" 
              class="form-control form-control-lg text-center"
              placeholder="000000"
              v-model="code"
              maxlength="6"
              pattern="\d{6}"
              inputmode="numeric"
              style="letter-spacing:0.5rem;font-size:1.5rem;font-weight:600;"
              required
              :disabled="loading">
          </div>

          <button type="submit" class="btn btn-gf w-100 mb-3" :disabled="loading || code.length !== 6">
            {{ loading ? 'Verifying...' : 'Verify & Complete Registration' }}
          </button>

          <div class="text-center">
            <button 
              type="button" 
              class="btn btn-link" 
              style="color:#2e7d32;font-size:0.9rem;text-decoration:none;"
              @click="handleResend"
              :disabled="resendLoading || resendCooldown > 0">
              {{ resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code' }}
            </button>
            <p style="color:#6a8f6a;font-size:0.8rem;margin-top:0.5rem;">Check your spam folder if you can't see it</p>
          </div>
        </form>

        <div class="mt-4 pt-3 text-center" style="border-top:1px solid #e8f4e6;font-size:0.85rem;color:#6a8f6a;">
          Wrong email? 
          <RouterLink to="/" style="color:#2e7d32;font-weight:600;text-decoration:none;">Start over</RouterLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const email = ref(route.query.email || '')
const code = ref('')
const loading = ref(false)
const resendLoading = ref(false)
const resendCooldown = ref(0)
const error = ref('')
const success = ref('')

let cooldownInterval = null

onMounted(() => {
  if (!email.value) {
    router.push('/')
  }
  startCooldown()
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})

function startCooldown() {
  resendCooldown.value = 10
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

async function handleVerify() {
  error.value = ''
  success.value = ''
  
  if (!/^\d{6}$/.test(code.value)) {
    error.value = 'Please enter a valid 6-digit code'
    return
  }

  loading.value = true
  try {
    const res = await fetch('/api/auth/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, code: code.value })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message || 'Verification failed'
      return
    }

    success.value = 'Email verified successfully!'
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  error.value = ''
  success.value = ''
  resendLoading.value = true

  try {
    const res = await fetch('/api/auth/register/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message || 'Failed to resend code'
      return
    }

    success.value = 'Verification code resent successfully'
    startCooldown()
  } catch (err) {
    error.value = 'Network error. Please try again.'
  } finally {
    resendLoading.value = false
  }
}
</script>
