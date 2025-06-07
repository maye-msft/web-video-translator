<template>
  <div class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-4 py-4">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-semibold text-gray-900">
            Video Translation Workflow
          </h2>
          <span class="text-sm text-gray-500"
            >{{ stepProgress }}% Complete</span
          >
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: stepProgress + '%' }"
          ></div>
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
              completedSteps.includes(step.number + 1)
                ? 'bg-blue-600'
                : 'bg-gray-200'
            "
          ></div>

          <!-- Step Button -->
          <button
            @click="navigateToStep(step.number)"
            :disabled="!canAccessStep(step.number) || isProcessing"
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
          @click="resetWorkflow"
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
          Start Over
        </button>

        <div class="flex space-x-3">
          <button
            v-if="currentStep > 1"
            @click="navigateToStep(currentStep - 1)"
            :disabled="isProcessing"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <button
            v-if="nextStep && canProceedToNext"
            @click="proceedToNext"
            :disabled="isProcessing"
            class="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Next: {{ getStepTitle(nextStep) }}
            <svg
              class="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            v-else-if="currentStep === 4 && completedSteps.includes(4)"
            class="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Workflow Complete!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useWorkflowState,
  type WorkflowStep,
} from '@/composables/useWorkflowState'

const router = useRouter()
const {
  workflowState,
  canAccessStep,
  stepProgress,
  nextStep,
  canProceedToNext,
  proceedToNext: proceedToNextStep,
  resetWorkflow: resetWorkflowState,
  jumpToStep,
} = useWorkflowState()

// Step definitions
const steps = [
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

// Methods
function navigateToStep(step: WorkflowStep) {
  if (canAccessStep.value(step) && !isProcessing.value) {
    jumpToStep(step)
    router.push(`/step-${step}`)
  }
}

function proceedToNext() {
  const next = proceedToNextStep()
  if (next) {
    router.push(`/step-${next}`)
  }
}

function resetWorkflow() {
  if (
    confirm(
      'Are you sure you want to start over? This will clear all progress and uploaded files.'
    )
  ) {
    resetWorkflowState()
    router.push('/step-1')
  }
}

function getStepTitle(step: WorkflowStep): string {
  return steps.find(s => s.number === step)?.title || ''
}

function getStepButtonClass(step: WorkflowStep): string {
  const base = 'transition-opacity'
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
