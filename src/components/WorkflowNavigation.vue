<template>
  <div class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-4 py-4">
      <!-- App Title -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Web Video Translator</h1>
        <!-- (Optional: add logo or icon here) -->
      </div>

      <!-- Artifacts Status Indicators -->
      <div class="mb-4">
        <div class="flex flex-wrap gap-2 text-xs">
          <span
            v-if="workflowState.artifacts.videoFile"
            class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800"
          >
            📹 Video: {{ workflowState.artifacts.videoFile.name.slice(0, 20)
            }}{{
              workflowState.artifacts.videoFile.name.length > 20 ? '...' : ''
            }}
          </span>
          <span
            v-if="workflowState.artifacts.extractedAudio"
            class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800"
          >
            🎵 Audio: {{ workflowState.artifacts.audioFormat?.toUpperCase() }}
          </span>
          <span
            v-if="workflowState.artifacts.transcriptionSRT"
            class="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800"
          >
            📝 Transcription:
            {{ workflowState.artifacts.transcriptionSegments.length }} segments
          </span>
          <span
            v-if="workflowState.artifacts.translatedSRT"
            class="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800"
          >
            🌐 Translation: {{ workflowState.artifacts.sourceLanguage }} →
            {{ workflowState.artifacts.targetLanguage }}
          </span>
        </div>
      </div>

      <!-- Step Navigation -->
      <nav class="flex justify-between">
        <div v-for="step in steps" :key="step.number" class="flex-1 relative">
          <!-- Step Connector Line -->
          <div
            v-if="step.number < 4"
            class="absolute top-5 left-1/2 w-full h-0.5 -z-10"
            :class="
              completedSteps.includes((step.number + 1) as WorkflowStep)
                ? 'bg-blue-600'
                : 'bg-gray-200'
            "
          ></div>

          <!-- Step Button -->
          <button
            @click="navigateToStep(step.number)"
            :disabled="
              step.number !== 0 && (!canAccessStep(step.number) || isProcessing)
            "
            class="w-full flex flex-col items-center group"
            :class="getStepButtonClass(step.number)"
          >
            <!-- Step Circle -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all"
              :class="getStepCircleClass(step.number)"
            >
              <svg
                v-if="completedSteps.includes(step.number)"
                class="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span
                v-else
                class="text-sm font-semibold"
                :class="
                  currentStep === step.number
                    ? 'text-white'
                    : getStepNumberClass(step.number)
                "
              >
                {{ step.number }}
              </span>
            </div>

            <!-- Step Label -->
            <div class="text-center">
              <div
                class="text-sm font-medium transition-colors"
                :class="getStepLabelClass(step.number)"
              >
                {{ step.title }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ step.description }}
              </div>
            </div>
          </button>
        </div>
      </nav>

      <!-- Action Buttons -->
      <div
        class="flex justify-between items-center mt-6 pt-4 border-t border-gray-100"
      >
        <button
          @click="showResetModal = true"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset All
        </button>
      </div>

      <!-- Reset Confirmation Modal -->
      <div
        v-if="showResetModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      >
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
          <h3 class="text-lg font-semibold mb-4">Reset All Progress?</h3>
          <p class="mb-6 text-gray-700">
            Are you sure you want to reset all progress and uploaded files? This
            action cannot be undone.
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showResetModal = false"
              class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="confirmReset"
              class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useWorkflowState,
  type WorkflowStep,
} from '@/composables/useWorkflowState'

const router = useRouter()
const {
  workflowState,
  canAccessStep,
  resetWorkflow: resetWorkflowState,
  jumpToStep,
} = useWorkflowState()

// Step definitions
const steps = [
  {
    number: 0 as WorkflowStep,
    title: 'CLI Tools',
    description: 'ffmpeg, Whisper & ChatGPT',
  },
  {
    number: 1 as WorkflowStep,
    title: 'Upload Video',
    description: 'Upload & extract audio',
  },
  {
    number: 2 as WorkflowStep,
    title: 'Generate Subtitles',
    description: 'Speech-to-text transcription',
  },
  {
    number: 3 as WorkflowStep,
    title: 'Translate',
    description: 'Translate subtitles',
  },
  {
    number: 4 as WorkflowStep,
    title: 'Merge & Download',
    description: 'Style & merge subtitles',
  },
]

// Computed properties
const currentStep = computed(() => workflowState.currentStep)
const completedSteps = computed(() => workflowState.completedSteps)
const isProcessing = computed(() => workflowState.isProcessing)

// Modal state
const showResetModal = ref(false)

// Methods
function navigateToStep(step: WorkflowStep) {
  // Step 0 is always accessible
  if (step === 0) {
    jumpToStep(step)
    router.push('/step-0')
    return
  }
  if (canAccessStep.value(step) && !isProcessing.value) {
    jumpToStep(step)
    router.push(`/step-${step}`)
  }
}

function resetWorkflow() {
  resetWorkflowState()
  router.push('/step-1')
}

function confirmReset() {
  showResetModal.value = false
  resetWorkflow()
}

function getStepButtonClass(step: WorkflowStep): string {
  const base = 'transition-opacity'
  if (step === 0) {
    return base + ' hover:opacity-80 cursor-pointer' // Always clickable
  }
  if (!canAccessStep.value(step)) {
    return `${base} opacity-50 cursor-not-allowed`
  }
  if (isProcessing.value) {
    return `${base} opacity-75 cursor-wait`
  }
  return `${base} hover:opacity-80 cursor-pointer`
}

function getStepCircleClass(step: WorkflowStep): string {
  if (completedSteps.value.includes(step)) {
    return 'bg-blue-600 text-white'
  }
  if (currentStep.value === step) {
    return 'bg-blue-600 text-white'
  }
  if (canAccessStep.value(step)) {
    return 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
  }
  return 'bg-gray-100 text-gray-400'
}

function getStepNumberClass(step: WorkflowStep): string {
  if (canAccessStep.value(step)) {
    return 'text-gray-700'
  }
  return 'text-gray-400'
}

function getStepLabelClass(step: WorkflowStep): string {
  if (completedSteps.value.includes(step)) {
    return 'text-blue-600'
  }
  if (currentStep.value === step) {
    return 'text-blue-600'
  }
  if (canAccessStep.value(step)) {
    return 'text-gray-900 group-hover:text-blue-600'
  }
  return 'text-gray-400'
}
</script>
