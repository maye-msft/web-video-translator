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
// Test Case 4: Add dynamic service import (should work with our fix)
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkflowState } from '@/composables/useWorkflowState'
import {
  WHISPER_MODELS,
  generateSRT,
  downloadSRT,
  preprocessAudio,
} from '@/utils/whisper'
// Dynamic import of whisperService to prevent auto-loading
import type { SubtitleSegment } from '@/utils/translation'
import { formatFileSize } from '@/utils/translation'

console.log('WorkflowStepTest with dynamic service import loaded at:', new Date().toISOString())
console.log('Whisper models available:', WHISPER_MODELS.length)

// Helper function to get whisper service dynamically
async function getWhisperService() {
  const { whisperService } = await import('@/services/whisperService')
  return whisperService
}

const router = useRouter()
const { workflowState, updateArtifacts, setProcessing, completeStep } = useWorkflowState()
const testValue = ref('Dynamic service import working - models: ' + WHISPER_MODELS.length)
</script>