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
// Test Case 5: Add AudioUpload component (testing component imports)
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AudioUpload from '@/components/AudioUpload.vue'
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

// Test the computed properties from WorkflowStep2
const selectedModel = ref(WHISPER_MODELS[0].name)
const isModelLoading = ref(false)
const isTranscribing = ref(false)
const uploadedAudioFile = ref<File | null>(null)

const hasExtractedAudio = computed(
  () => workflowState.artifacts.extractedAudio !== null
)
const hasAudioSource = computed(
  () => hasExtractedAudio.value || uploadedAudioFile.value !== null
)
const whisperModels = computed(() => WHISPER_MODELS)

const getSelectedModelName = computed(() => {
  const model = WHISPER_MODELS.find(m => m.name === selectedModel.value)
  return model?.displayName || selectedModel.value
})

const selectedModelInfo = computed(() => {
  return WHISPER_MODELS.find(m => m.name === selectedModel.value)
})

const getTranscribeButtonText = computed(() => {
  if (isModelLoading.value) return 'Loading Model...'
  if (isTranscribing.value) return 'Generating Subtitles...'
  // Always show download text since we can't easily check model state synchronously
  return `Download ${getSelectedModelName.value} & Generate Subtitles`
})

const testValue = ref('All computed properties added - button: ' + getTranscribeButtonText.value)
</script>