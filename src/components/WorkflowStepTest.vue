<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Step Test: Minimal Page
      </h1>
      <p class="text-gray-600 mb-4">
        This is a minimal test page to isolate loading issues.
      </p>
      <div class="bg-green-100 p-4 rounded">
        <p>If you can see this, the page loaded successfully!</p>
        <p>Current time: {{ new Date().toISOString() }}</p>
        <p>Test Value: {{ testValue }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Test Case 1: Add Vue imports first
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'

console.log('WorkflowStepTest with Vue imports loaded at:', new Date().toISOString())

const router = useRouter()
const testValue = ref('Vue imports working')
</script>