<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <!-- Test Case 12: Add WorkflowStep2 Header and Help Section -->
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">
          Step Test: Header + Help Section
        </h1>
        <button
          @click="showHelp = !showHelp"
          class="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
          title="Show help"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      <p class="text-gray-600 mb-4">
        Convert your audio to text using AI speech recognition. Choose a Whisper
        model and generate accurate subtitles with timestamps.
      </p>

      <!-- Help Section -->
      <div
        v-if="showHelp"
        class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <h3 class="text-lg font-semibold text-blue-900 mb-3">Step 2 Guide</h3>
        <div class="space-y-2 text-sm text-blue-800">
          <p><strong>What happens in this step:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Use AI to convert speech to text</li>
            <li>Generate SRT subtitle files with precise timing</li>
            <li>Preview and edit transcription before proceeding</li>
            <li>Download transcription for backup or external use</li>
          </ul>
          <p class="mt-3"><strong>Model Selection:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Tiny:</strong> Fastest, good for clear speech (~39MB)
            </li>
            <li><strong>Base:</strong> Balanced speed and accuracy (~74MB)</li>
            <li><strong>Small:</strong> Better accuracy, slower (~244MB)</li>
            <li>
              <strong>Medium:</strong> High accuracy for complex audio (~769MB)
            </li>
          </ul>
          <p class="mt-3">
            <strong>Tips:</strong> Larger models provide better accuracy but
            take longer to load and process.
          </p>
        </div>
      </div>

      <!-- Audio Source Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Audio Source</h2>

        <!-- Unified Audio Source Selection Panel -->
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Option 1: Use Audio from Step 1 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="audioSource"
                  type="radio"
                  value="step1"
                  :disabled="!hasExtractedAudio"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Use Audio from Step 1
                </span>
              </label>
              <div
                v-if="hasExtractedAudio"
                class="flex items-center text-sm text-green-600"
              >
                <svg
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ workflowState.artifacts.audioFormat?.toUpperCase() }} format,
                {{
                  formatFileSize(
                    workflowState.artifacts.extractedAudio?.byteLength || 0
                  )
                }}
              </div>
            </div>

            <div v-if="!hasExtractedAudio" class="ml-7 text-sm text-gray-500">
              No audio available from Step 1. Complete Step 1 first or upload
              audio below.
            </div>
          </div>

          <!-- Option 2: Upload Audio File -->
          <div>
            <div class="flex items-center mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="audioSource"
                  type="radio"
                  value="upload"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Upload Audio File
                </span>
              </label>
            </div>

            <div v-if="audioSource === 'upload'" class="ml-7">
              <p class="text-sm text-gray-600 mb-3">
                Upload your own audio file for transcription. Supported formats:
                MP3, WAV, M4A, OGG, FLAC up to 100MB.
              </p>
              <AudioUpload
                @file-selected="handleAudioSelected"
                @file-cleared="handleAudioCleared"
                :initial-file="uploadedAudioFile"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Model Selection -->
      <div v-if="hasAudioSource" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Choose Whisper Model</h2>
        <div class="max-w-md">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Whisper Model
          </label>
          <select
            v-model="selectedModel"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          >
            <option
              v-for="model in whisperModels"
              :key="model.name"
              :value="model.name"
            >
              {{ model.displayName }} ({{ model.size }})
            </option>
          </select>

          <!-- Selected Model Description -->
          <div v-if="selectedModelInfo" class="mt-3 p-3 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-1">
              {{ selectedModelInfo.displayName }}
            </h4>
            <p class="text-sm text-gray-600 mb-2">
              {{ selectedModelInfo.description }}
            </p>
            <p class="text-xs text-gray-500">
              Model Size: {{ selectedModelInfo.size }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-green-100 p-4 rounded mb-4">
        <p>If you can see this, the page loaded successfully!</p>
        <p>Current time: {{ new Date().toISOString() }}</p>
        <p>Test Value: {{ testValue }}</p>
        <p>Show Help: {{ showHelp }}</p>
      </div>
      
      <!-- Test Case 7: Add AudioUpload component -->
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-4">Test AudioUpload Component</h3>
        <AudioUpload 
          @file-selected="handleAudioSelected"
          @file-cleared="handleAudioCleared"
          :initial-file="uploadedAudioFile"
        />
      </div>

      <!-- Transcription Section -->
      <div v-if="hasAudioSource && selectedModel" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Generate Transcription</h2>
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Generate Subtitles Button (with automatic model initialization) -->
          <button
            @click="startTranscriptionWithAutoInit"
            :disabled="isTranscribing || isModelLoading"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {{ getTranscribeButtonText }}
          </button>

          <!-- Multi-Stage Progress System (inspired by whisper-web) -->

          <!-- Model Loading Progress Items -->
          <div
            v-if="progressItems.length > 0"
            class="mb-4 space-y-2"
            data-testid="progress-items"
          >
            <div class="text-sm font-medium text-gray-700 mb-2">
              Loading model files... (only runs once)
            </div>
            <div
              v-for="item in progressItems"
              :key="item.file"
              class="bg-blue-50 rounded-lg p-3"
            >
              <div class="flex justify-between text-xs mb-1">
                <span class="text-blue-800">{{ item.name || item.file }}</span>
                <span class="text-blue-600"
                  >{{ Math.round(item.progress) }}%</span
                >
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: item.progress + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Audio Processing Progress -->
          <div
            v-if="isAudioProcessing"
            class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            data-testid="audio-processing"
          >
            <div class="flex justify-between text-sm font-medium mb-2">
              <span class="text-yellow-800">Processing audio file...</span>
              <span class="text-yellow-600"
                >{{ audioProcessingProgress }}%</span
              >
            </div>
            <div class="w-full bg-yellow-200 rounded-full h-3">
              <div
                class="bg-yellow-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: audioProcessingProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Transcription Progress -->
          <div
            v-if="isTranscribing"
            class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            data-testid="transcription-progress"
          >
            <div class="flex justify-between text-sm font-medium mb-2">
              <span class="text-green-800">{{ transcriptionStatus }}</span>
              <span class="text-green-600">{{ transcriptionProgress }}%</span>
            </div>

            <!-- Main Progress Bar -->
            <div class="w-full bg-green-200 rounded-full h-4 shadow-inner mb-3">
              <div
                class="bg-green-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                :style="{ width: transcriptionProgress + '%' }"
              ></div>
            </div>

            <!-- Chunk Progress Details -->
            <div v-if="chunkInfo" class="space-y-2">
              <div class="flex justify-between text-xs text-green-700">
                <span>Processing chunks:</span>
                <span
                  >{{ chunkInfo.currentChunk }} /
                  {{ chunkInfo.totalChunks }}</span
                >
              </div>

              <!-- Individual Chunk Progress -->
              <div class="w-full bg-green-100 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: chunkInfo.chunkProgress + '%' }"
                ></div>
              </div>

              <!-- Current Chunk Text Preview -->
              <div
                v-if="chunkInfo.chunkText"
                class="text-xs text-green-600 italic truncate"
              >
                Current: "{{ chunkInfo.chunkText.slice(0, 60)
                }}{{ chunkInfo.chunkText.length > 60 ? '...' : '' }}"
              </div>
            </div>

            <div class="text-xs text-green-700 mt-2">
              {{ getTranscriptionStageText() }}
            </div>
          </div>

          <!-- Error Display -->
          <div
            v-if="transcriptionError"
            class="mb-4 bg-red-50 border border-red-200 rounded-md p-3"
          >
            <div class="flex">
              <svg
                class="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Transcription Error
                </h3>
                <p class="mt-1 text-sm text-red-700">
                  {{ transcriptionError }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- ...existing code... -->
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

// Test all state variables from WorkflowStep2
const showHelp = ref<boolean>(false)
const audioSource = ref<string>('upload')
const srtEditor = ref<HTMLTextAreaElement>()
const isAutoSaving = ref<boolean>(false)
const lastSaved = ref<Date | null>(null)
const validationErrors = ref<string[]>([])
const autoSaveTimeout = ref<NodeJS.Timeout | null>(null)
const uploadedAudioFile = ref<File | null>(null)
const audioURL = ref<string>('')
const selectedModel = ref<string>(WHISPER_MODELS[0].name)
const transcriptionSRT = ref<string>('')
const transcriptionSegments = ref<any[]>([])
const progressItems = ref<any[]>([])
const isModelLoading = ref<boolean>(false)
const modelLoadProgress = ref<number>(0)
const isAudioProcessing = ref<boolean>(false)
const audioProcessingProgress = ref<number>(0)
const isTranscribing = ref<boolean>(false)
const transcriptionProgress = ref<number>(0)
const transcriptionStatus = ref<string>('')
const transcriptionStage = ref<string>('preparing')
const transcriptionError = ref<string>('')
const chunkInfo = ref<any | null>(null)

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

// Handler functions for AudioUpload
function handleAudioSelected(file: File) {
  uploadedAudioFile.value = file
  console.log('Audio file selected:', file.name)
}

function handleAudioCleared() {
  uploadedAudioFile.value = null
  console.log('Audio file cleared')
}

// Test Case 9: Add all remaining functions from WorkflowStep2
function createAudioURL() {
  console.log('createAudioURL called')
}

function handleSRTEdit() {
  console.log('handleSRTEdit called')
}

function autoSaveSRT() {
  console.log('autoSaveSRT called')
}

function handleEditorKeydown(event: KeyboardEvent) {
  console.log('handleEditorKeydown called')
}

function getWordCount(): number {
  return 0
}

function getTimeAgo(date: Date): string {
  return 'now'
}

function validateSRT() {
  console.log('validateSRT called')
}

function formatSRT() {
  console.log('formatSRT called')
}

function downloadTranscriptionSRT() {
  console.log('downloadTranscriptionSRT called')
}

function formatTimestamp(seconds: number): string {
  return '00:00:00,000'
}

function getTranscriptionStageText(): string {
  return 'test stage'
}

function formatProgressItemName(file: string): string {
  return file
}

function goToStep3() {
  console.log('goToStep3 called')
}

function parseSRTToSegments(srtContent: string) {
  return []
}

function parseTimestamp(timestamp: string): number {
  return 0
}

function startTranscriptionWithAutoInit() {
  console.log('startTranscriptionWithAutoInit called')
}

function initializeWhisperModel() {
  console.log('initializeWhisperModel called')
}

function startTranscription() {
  console.log('startTranscription called')
}

// Test Case 10: Add onMounted lifecycle hook
onMounted(() => {
  console.log('WorkflowStepTest onMounted called')
  
  // Initialize from workflow state (in case we navigated back to this step)
  if (workflowState.artifacts.audioFile) {
    uploadedAudioFile.value = workflowState.artifacts.audioFile
  }
  if (workflowState.artifacts.selectedWhisperModel) {
    selectedModel.value = workflowState.artifacts.selectedWhisperModel
  }
  if (workflowState.artifacts.transcriptionSRT) {
    transcriptionSRT.value = workflowState.artifacts.transcriptionSRT
  }
  if (workflowState.artifacts.transcriptionSegments) {
    transcriptionSegments.value =
      workflowState.artifacts.transcriptionSegments.map(s => ({
        ...s,
        timestamp: [s.timestamp[0], s.timestamp[1]] as [number, number],
      }))
  }

  createAudioURL()
})

// Test Case 11: Add onUnmounted lifecycle hook
onUnmounted(() => {
  console.log('WorkflowStepTest onUnmounted called')
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
  }
})
</script>