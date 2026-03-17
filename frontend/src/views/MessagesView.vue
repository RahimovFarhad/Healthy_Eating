<!--
  MessagesView.vue — Chat / messaging page
  Layout:
    • Left sidebar: nutritionist profile card + shared goals card
    • Right area: scrollable chat window + message reply box

  How messaging works (prototype):
    - Messages are stored in the `messages` ref array
    - `from: 'pro'`  = nutritionist message (grey bubble, left-aligned)
    - `from: 'me'`   = user message (green bubble, right-aligned)
    - sendMessage() appends a new message and clears the input
    - In a real app, sendMessage() would POST to the backend API
-->
<template>
  <div class="container-fluid px-4 py-3">

    <!-- ============================================================
         PAGE HEADER
         ============================================================ -->
    <div class="p-3 mb-3 rounded" style="background:#e8f4e6;border:1px solid #b0d4ac;">
      <h4 style="color:#1a4a18;" class="mb-0">💬 Messages</h4>
      <small class="text-secondary">Communicate with your nutrition professional</small>
    </div>

    <div class="row g-3">

      <!-- ============================================================
           LEFT SIDEBAR
           ============================================================ -->
      <div class="col-md-4">

        <!-- ---- Nutritionist profile card ---- -->
        <div class="card card-gf p-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <!-- Avatar circle showing initials -->
            <div class="avatar-circle" style="width:52px;height:52px;font-size:1rem;">?</div>
            <div>
              <div class="fw-bold text-muted">No professional assigned</div>
              <div class="text-muted small">A nutritionist will be linked to your account</div>
            </div>
          </div>
          <hr>
          <div class="small text-muted">
            <div class="mb-1">📅 Next check-in: —</div>
            <div>📊 Last report shared: —</div>
          </div>
        </div>

        <!-- ---- Shared goals ---- -->
        <div class="card border p-3">
          <h6 class="fw-bold mb-2" style="color:#1a4a18;">Shared Goals</h6>
          <div class="small text-muted">
            <div>No shared goals yet.</div>
          </div>
        </div>

      </div>

      <!-- ============================================================
           CHAT AREA
           ============================================================ -->
      <div class="col-md-8">
        <div class="card border" style="height:420px;display:flex;flex-direction:column;">
          <div class="card-header fw-bold small" style="background:#d6e8d4;">
            💬 Conversation
          </div>

          <!-- Scrollable message list -->
          <div class="card-body overflow-auto flex-grow-1 p-3" ref="chatBody">
            <!-- Empty state -->
            <div v-if="messages.length === 0" class="text-center text-muted py-4">
              <small>No messages yet. Your conversation with your nutritionist will appear here.</small>
            </div>
            <div v-for="msg in messages" :key="msg.id" class="mb-2">

              <!-- Professional / nutritionist message — left-aligned, grey bubble -->
              <div v-if="msg.from === 'pro'" class="chat-pro" style="max-width:80%;">
                <div class="fw-semibold small mb-1" style="color:#555;">Your Nutritionist</div>
                <div class="small">{{ msg.text }}</div>
                <div class="text-muted mt-1" style="font-size:0.7rem;">{{ msg.time }}</div>
              </div>

              <!-- User's own message — right-aligned, green bubble -->
              <div v-else class="chat-mine ms-auto" style="max-width:80%;">
                <div class="small">{{ msg.text }}</div>
                <div class="text-muted mt-1" style="font-size:0.7rem;">{{ msg.time }}</div>
              </div>

            </div>
          </div>

          <!-- Reply input + send button -->
          <div class="card-footer p-2" style="background:#f9f9f9;">
            <div class="d-flex gap-2">
              <!--
                v-model binds the input to `newMessage`.
                @keyup.enter lets the user press Enter to send.
              -->
              <input type="text"
                     class="form-control form-control-sm"
                     placeholder="Type a message..."
                     v-model="newMessage"
                     @keyup.enter="sendMessage">
              <button class="btn btn-gf btn-sm px-3" @click="sendMessage">Send</button>
            </div>
          </div>

        </div>
      </div><!-- end chat col -->

    </div><!-- end row -->

  </div>
</template>

<script setup>
import { ref } from 'vue'

// ---- New message input state ----
const newMessage = ref('')

// ---- Conversation history — empty until messages are loaded from the API ----
const messages = ref([])

// ---- Send a message ----
// Adds the user's message to the array and clears the input field
function sendMessage() {
  if (!newMessage.value.trim()) return   // ignore blank messages

  messages.value.push({
    id:   Date.now(),    // unique key using timestamp
    from: 'me',
    text: newMessage.value,
    time: 'Just now',
  })

  newMessage.value = ''  // clear the input

  // In a real app: POST message to backend API, then refresh/poll for new messages
}
</script>
