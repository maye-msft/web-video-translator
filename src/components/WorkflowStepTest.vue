<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">
          Step 2: Generate Subtitles
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

      <!-- Transcription Results -->
      <div v-if="transcriptionSRT" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Transcription Results</h2>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg
                class="h-5 w-5 text-green-600 mr-2"
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
              <span class="text-sm font-medium text-green-800">
                Transcription complete ({{ transcriptionSegments.length }}
                segments)
              </span>
            </div>
            <button
              @click="downloadTranscriptionSRT"
              class="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Download SRT
            </button>
          </div>
        </div>

        <!-- Subtitle Editor -->
        <div class="border rounded-lg">
          <div class="p-4 border-b bg-gray-50">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">Subtitle Editor</h3>
              <div class="flex items-center space-x-3">
                <span class="text-xs text-gray-500">
                  {{ transcriptionSegments.length }} segments |
                  {{ getWordCount() }} words
                </span>
                <button
                  @click="validateSRT"
                  class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Validate
                </button>
                <button
                  @click="formatSRT"
                  class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                >
                  Format
                </button>
              </div>
            </div>
          </div>
          <div class="relative">
            <textarea
              ref="srtEditor"
              v-model="transcriptionSRT"
              @input="handleSRTEdit"
              @keydown="handleEditorKeydown"
              class="w-full h-80 font-mono text-sm border-0 resize-none focus:ring-0 focus:outline-none p-4 leading-relaxed"
              placeholder="Transcription will appear here... 

Format: 
1
00:00:00,000 --> 00:00:05,000
Subtitle text here"
              spellcheck="true"
            ></textarea>

            <!-- Auto-save indicator -->
            <div
              v-if="isAutoSaving"
              class="absolute top-2 right-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
            >
              Saving...
            </div>
            <div
              v-else-if="lastSaved"
              class="absolute top-2 right-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded"
            >
              Saved {{ getTimeAgo(lastSaved) }}
            </div>
          </div>

          <!-- Validation messages -->
          <div
            v-if="validationErrors.length > 0"
            class="p-4 border-t bg-red-50"
          >
            <h4 class="text-sm font-medium text-red-800 mb-2">
              SRT Validation Errors:
            </h4>
            <ul class="text-xs text-red-700 space-y-1">
              <li v-for="(error, index) in validationErrors" :key="index">
                • {{ error }}
              </li>
            </ul>
          </div>

          <!-- Editor help -->
          <div class="p-4 border-t bg-blue-50">
            <details class="text-sm">
              <summary class="cursor-pointer text-blue-800 font-medium mb-2">
                Editing Tips
              </summary>
              <div class="text-blue-700 space-y-1 text-xs">
                <p>
                  • <strong>Format:</strong> Each subtitle needs: number,
                  timestamps, and text
                </p>
                <p>
                  • <strong>Timestamps:</strong> Format: 00:00:00,000 -->
                  00:00:05,000
                </p>
                <p>
                  • <strong>Shortcuts:</strong> Ctrl+S to save, Ctrl+A to select
                  all
                </p>
                <p>
                  • <strong>Auto-save:</strong> Changes are saved automatically
                  every 3 seconds
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- Go to Step 3 Button (inside panel) -->
      <div v-if="transcriptionSRT" class="flex justify-end mt-8">
        <button
          @click="goToStep3"
          class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md"
        >
          <span>Next: Translate Subtitles</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
    <!-- end panel -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
import { useRouter } from 'vue-router'

const router = useRouter()

const { workflowState, updateArtifacts, setProcessing, completeStep } =
  useWorkflowState()

// UI state
const showHelp = ref<boolean>(false)
const audioSource = ref<string>(
  workflowState.artifacts.extractedAudio ? 'step1' : 'upload'
)

// Editor state
const srtEditor = ref<HTMLTextAreaElement>()
const isAutoSaving = ref<boolean>(false)
const lastSaved = ref<Date | null>(null)
const validationErrors = ref<string[]>([])
const autoSaveTimeout = ref<NodeJS.Timeout | null>(null)

// Reactive state
const uploadedAudioFile = ref<File | null>(workflowState.artifacts.audioFile)
const audioURL = ref<string>('')
const selectedModel = ref<string>(
  workflowState.artifacts.selectedWhisperModel || WHISPER_MODELS[0].name
)
const transcriptionSRT = ref<string>(
  workflowState.artifacts.transcriptionSRT || ''
)
const transcriptionSegments = ref<SubtitleSegment[]>(
  workflowState.artifacts.transcriptionSegments
    ? workflowState.artifacts.transcriptionSegments.map(s => ({
        ...s,
        timestamp: [s.timestamp[0], s.timestamp[1]] as [number, number],
      }))
    : []
)

// Processing state - Multi-stage progress system inspired by whisper-web
const progressItems = ref<
  Array<{
    file: string
    name: string
    progress: number
    loaded: number
    total: number
    status: string
  }>
>([])
const isModelLoading = ref<boolean>(false)
const modelLoadProgress = ref<number>(0)
const isAudioProcessing = ref<boolean>(false)
const audioProcessingProgress = ref<number>(0)
const isTranscribing = ref<boolean>(false)
const transcriptionProgress = ref<number>(0)
const transcriptionStatus = ref<string>('')
const transcriptionStage = ref<string>('preparing')
const transcriptionError = ref<string>('')
const chunkInfo = ref<{
  currentChunk: number
  totalChunks: number
  chunkProgress: number
  chunkText?: string
} | null>(null)

// Computed properties
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

// Setup audio URL on mount
onMounted(() => {

})

// Cleanup on unmount
onUnmounted(() => {
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
  }
})

// Watch for changes to update workflow state
// Fix: Only update artifacts if values have changed to prevent infinite watcher loop
watch([selectedModel, transcriptionSRT, transcriptionSegments], () => {
  const artifacts = workflowState.artifacts
  const needsUpdate =
    artifacts.selectedWhisperModel !== selectedModel.value ||
    artifacts.transcriptionSRT !== transcriptionSRT.value ||
    JSON.stringify(artifacts.transcriptionSegments) !== JSON.stringify(transcriptionSegments.value) ||
    artifacts.originalSRT !== transcriptionSRT.value

  if (needsUpdate) {
    updateArtifacts({
      selectedWhisperModel: selectedModel.value,
      transcriptionSRT: transcriptionSRT.value,
      transcriptionSegments: transcriptionSegments.value,
      originalSRT: transcriptionSRT.value, // Also set as original for translation
    })
  }

  // Check if step is complete
  if (transcriptionSRT.value !== '') {
    completeStep(2)
  }
})

// Watch for workflow state changes to sync back to local state
watch(
  () => workflowState.artifacts,
  newArtifacts => {
    if (newArtifacts.audioFile !== uploadedAudioFile.value) {
      uploadedAudioFile.value = newArtifacts.audioFile
      createAudioURL()
    }
    if (newArtifacts.selectedWhisperModel !== selectedModel.value) {
      selectedModel.value = newArtifacts.selectedWhisperModel
    }
    if (newArtifacts.transcriptionSRT !== transcriptionSRT.value) {
      transcriptionSRT.value = newArtifacts.transcriptionSRT
    }
    if (newArtifacts.transcriptionSegments !== transcriptionSegments.value) {
      transcriptionSegments.value = newArtifacts.transcriptionSegments
        ? newArtifacts.transcriptionSegments.map(s => ({
            ...s,
            timestamp: [s.timestamp[0], s.timestamp[1]] as [number, number],
          }))
        : []
    }
  },
  { deep: true }
)

// Initialize audio source selection based on workflow state
watch(
  [hasExtractedAudio],
  () => {
    if (hasExtractedAudio.value && audioSource.value === 'upload') {
      audioSource.value = 'step1'
    }
  },
  { immediate: true }
)

// Watch for audio source selection changes
watch(audioSource, newSource => {
  if (newSource === 'step1' && hasExtractedAudio.value) {
    // Use Step 1 audio
    updateArtifacts({ audioFile: null }) // Clear uploaded audio
  } else if (newSource === 'upload' && uploadedAudioFile.value) {
    // Use uploaded audio
    updateArtifacts({ audioFile: uploadedAudioFile.value })
  }
})

// Helper function to get whisper service dynamically
async function getWhisperService() {
  const { whisperService } = await import('@/services/whisperService')
  return whisperService
}

// Methods
function createAudioURL() {
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }

  if (hasExtractedAudio.value && workflowState.artifacts.extractedAudio) {
    const format = workflowState.artifacts.audioFormat || 'wav'
    const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
    const blob = new Blob([workflowState.artifacts.extractedAudio], {
      type: mimeType,
    })
    audioURL.value = URL.createObjectURL(blob)
  } else if (uploadedAudioFile.value) {
    audioURL.value = URL.createObjectURL(uploadedAudioFile.value)
  }
}

function handleAudioSelected(file: File) {
  uploadedAudioFile.value = file
  if (audioSource.value === 'upload') {
    updateArtifacts({ audioFile: file })
  }
  createAudioURL()
}

function handleAudioCleared() {
  uploadedAudioFile.value = null
  if (audioSource.value === 'upload') {
    updateArtifacts({ audioFile: null })
  }
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }
}

async function startTranscriptionWithAutoInit() {
  if (!hasAudioSource.value) return

  // Clear previous subtitle and panel status before starting
  transcriptionSRT.value = ''
  transcriptionSegments.value = []
  validationErrors.value = []
  lastSaved.value = null

  try {
    // Initialize model if not ready
    const whisperService = await getWhisperService()
    if (
      !whisperService.isModelLoaded() ||
      whisperService.getCurrentModelName() !== selectedModel.value
    ) {
      await initializeWhisperModel()
    }

    // Proceed with transcription
    await startTranscription()
  } catch (error) {
    console.error('Transcription with auto-init failed:', error)
    transcriptionError.value =
      error instanceof Error ? error.message : 'Transcription failed'
  }
}

async function initializeWhisperModel() {
  try {
    isModelLoading.value = true
    progressItems.value = []
    modelLoadProgress.value = 0
    transcriptionStatus.value = `Loading ${getSelectedModelName.value} model...`

    const whisperService = await getWhisperService()
    await whisperService.initializeWhisper(
      selectedModel.value,
      (progress: any) => {
        // Handle overall model loading progress
        modelLoadProgress.value = progress.progress || 0
        transcriptionStatus.value = `Loading ${getSelectedModelName.value} model...`
      },
      (items: any[]) => {
        // Handle progress items (whisper-web style file-level progress)
        progressItems.value = items.map(item => ({
          ...item,
          name: item.name || formatProgressItemName(item.file),
        }))
        console.log('Progress items updated:', progressItems.value)
      }
    )

    // Clear progress items when loading is complete
    progressItems.value = []

    isModelLoading.value = false
  } catch (err) {
    transcriptionError.value =
      err instanceof Error
        ? `Model load failed: ${err.message}`
        : 'Model load failed'
    progressItems.value = []
    isModelLoading.value = false
    throw err
  }
}

async function startTranscription() {
  if (!hasAudioSource.value) return

  try {
    console.log('🎙️ Starting transcription process...')

    setProcessing(true)
    isTranscribing.value = true
    transcriptionError.value = ''
    transcriptionProgress.value = 0
    transcriptionStatus.value = 'Preparing transcription...'

    console.log('📊 Transcription progress bar state:', {
      isTranscribing: isTranscribing.value,
      progress: transcriptionProgress.value,
      status: transcriptionStatus.value,
    })

    // Force DOM update to show progress bar immediately
    await nextTick()
    console.log(
      '🔄 DOM updated, transcription progress bar should be visible now'
    )

    // Add a small delay to ensure the UI renders
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('⏱️ Transcription initial delay complete')

    // Get audio source
    let audioFile: File
    if (uploadedAudioFile.value) {
      audioFile = uploadedAudioFile.value
    } else if (
      hasExtractedAudio.value &&
      workflowState.artifacts.extractedAudio
    ) {
      // Create file from extracted audio
      const format = workflowState.artifacts.audioFormat || 'wav'
      const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
      const blob = new Blob([workflowState.artifacts.extractedAudio], {
        type: mimeType,
      })
      audioFile = new File([blob], `extracted-audio.${format}`, {
        type: mimeType,
      })
    } else {
      throw new Error('No audio source available')
    }

    // Stage 1: Audio processing (inspired by whisper-web)
    isAudioProcessing.value = true
    audioProcessingProgress.value = 0
    transcriptionStage.value = 'preparing'

    console.log('🎵 Starting audio preprocessing...')

    // Simulate audio processing progress
    const audioProcessInterval = setInterval(() => {
      audioProcessingProgress.value = Math.min(
        audioProcessingProgress.value + 15,
        95
      )
    }, 100)

    // Convert audio file to Float32Array
    const audioData = await preprocessAudio(audioFile)

    // Complete audio processing
    clearInterval(audioProcessInterval)
    audioProcessingProgress.value = 100
    await new Promise(resolve => setTimeout(resolve, 500))
    isAudioProcessing.value = false

    console.log('✅ Audio preprocessing complete')

    // Stage 2: Transcription with proper progress tracking
    transcriptionProgress.value = 0
    transcriptionStage.value = 'loading'
    transcriptionStatus.value = 'Starting transcription...'

    // Force DOM update
    await nextTick()

    // Progress callback for transcription
    const onTranscriptionProgress = (progress: number) => {
      isModelLoading.value = false
      const clamped = Math.max(0, Math.min(100, Math.round(progress)))
      transcriptionProgress.value = clamped
      if (clamped < 100) {
        transcriptionStatus.value = `Generating subtitles... ${clamped}%`
      } else {
        transcriptionStatus.value = 'Transcription complete!'
        transcriptionStage.value = 'complete'
      }
      // Log transcription progress
      console.log(`📈 Transcription progress: ${clamped}%`)
    }

    // Chunk progress callback
    const onChunkProgress = (chunkData: any) => {
      // Only log if chunk index or progress is nonzero (to avoid duplicate logs for 0)
      if (
        (chunkData.currentChunk && chunkData.currentChunk > 0) ||
        (chunkData.chunkProgress && chunkData.chunkProgress > 0) ||
        (chunkData.chunkText && chunkData.chunkText.length > 0)
      ) {
        console.log(`🧩 Chunk progress:`, {
          currentChunk: chunkData.currentChunk,
          totalChunks: chunkData.totalChunks,
          chunkProgress: chunkData.chunkProgress,
          chunkText: chunkData.chunkText,
        })
      }
      chunkInfo.value = {
        currentChunk: chunkData.currentChunk || 0,
        totalChunks: chunkData.totalChunks || 0,
        chunkProgress: chunkData.chunkProgress || 0,
        chunkText: chunkData.chunkText,
      }
    }

    // Stage change callback
    const onStageChange = (stage: string) => {
      transcriptionStage.value = stage
      console.log(`🔄 Transcription stage: ${stage}`)
    }

    try {
      // Start transcription using whisper service
      const whisperService = await getWhisperService()
      const result = await whisperService.transcribeAudio(
        audioData,
        {
          language: 'english',
          task: 'transcribe',
          return_timestamps: true,
          chunk_length_s: 30,
        },
        onTranscriptionProgress,
        onStageChange,
        onChunkProgress
      )

      // Generate SRT from result
      const srtContent = generateSRT(result)
      transcriptionSRT.value = srtContent

      // Convert to segments for workflow state
      const segments = result.chunks.map((chunk, index) => ({
        index: index + 1,
        startTime: formatTimestamp(chunk.timestamp[0]),
        endTime: formatTimestamp(chunk.timestamp[1]),
        text: chunk.text.trim(),
        timestamp: chunk.timestamp,
      }))

      transcriptionSegments.value = segments
      transcriptionStatus.value = 'Transcription complete!'
      transcriptionProgress.value = 100

      console.log('✅ Transcription completed successfully!')

      // Ensure progress bar is visible for at least 2 seconds
      console.log(
        '⏰ Keeping transcription progress bar visible for 2 seconds...'
      )
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Transcription failed:', error)
      throw error
    }
  } catch (error) {
    console.error('Transcription failed:', error)
    transcriptionError.value =
      error instanceof Error ? error.message : 'Transcription failed'
  } finally {
    isTranscribing.value = false
    isModelLoading.value = false
    isAudioProcessing.value = false
    progressItems.value = []
    chunkInfo.value = null // Clear chunk info when done
    setProcessing(false)
  }
}

function handleSRTEdit() {
  // Clear previous auto-save timeout
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value)
  }

  // Clear validation errors when editing
  validationErrors.value = []

  // Set up auto-save with 3-second delay
  autoSaveTimeout.value = setTimeout(() => {
    autoSaveSRT()
  }, 3000)
}

function autoSaveSRT() {
  isAutoSaving.value = true

  // Update workflow state when user edits SRT
  updateArtifacts({
    transcriptionSRT: transcriptionSRT.value,
    originalSRT: transcriptionSRT.value,
  })

  // Parse and update segments
  try {
    const segments = parseSRTToSegments(transcriptionSRT.value)
    transcriptionSegments.value = segments
    updateArtifacts({
      transcriptionSegments: segments,
    })
  } catch (error) {
    console.warn('Failed to parse SRT during auto-save:', error)
  }

  setTimeout(() => {
    isAutoSaving.value = false
    lastSaved.value = new Date()
  }, 500)
}

function handleEditorKeydown(event: KeyboardEvent) {
  // Handle Ctrl+S for manual save
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    autoSaveSRT()
  }
}

function getWordCount(): number {
  if (!transcriptionSRT.value) return 0
  return transcriptionSRT.value
    .replace(/\d+\n/g, '') // Remove subtitle numbers
    .replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, '') // Remove timestamps
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function validateSRT() {
  validationErrors.value = []

  if (!transcriptionSRT.value.trim()) {
    validationErrors.value.push('SRT content is empty')
    return
  }

  const lines = transcriptionSRT.value.split('\n')
  let currentIndex = 1
  let i = 0

  while (i < lines.length) {
    // Skip empty lines
    while (i < lines.length && !lines[i].trim()) {
      i++
    }

    if (i >= lines.length) break

    // Check subtitle number
    if (!lines[i] || !lines[i].match(/^\d+$/)) {
      validationErrors.value.push(
        `Line ${i + 1}: Expected subtitle number ${currentIndex}, found "${lines[i]}"`
      )
      break
    }

    if (parseInt(lines[i]) !== currentIndex) {
      validationErrors.value.push(
        `Line ${i + 1}: Expected subtitle number ${currentIndex}, found ${lines[i]}`
      )
    }

    i++

    // Check timestamp
    if (
      i >= lines.length ||
      !lines[i].match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)
    ) {
      validationErrors.value.push(
        `Line ${i + 1}: Invalid or missing timestamp format`
      )
      break
    }

    i++

    // Check subtitle text (at least one line)
    if (i >= lines.length || !lines[i].trim()) {
      validationErrors.value.push(`Line ${i + 1}: Missing subtitle text`)
      break
    }

    // Skip subtitle text lines
    while (i < lines.length && lines[i].trim()) {
      i++
    }

    currentIndex++
  }

  if (validationErrors.value.length === 0) {
    validationErrors.value.push('✓ SRT format is valid')
    setTimeout(() => {
      validationErrors.value = []
    }, 3000)
  }
}

function formatSRT() {
  try {
    const segments = parseSRTToSegments(transcriptionSRT.value)
    const formattedSRT = generateSRT({
      text: '',
      chunks: segments.map(s => ({ text: s.text, timestamp: s.timestamp })),
    })
    transcriptionSRT.value = formattedSRT
    autoSaveSRT()
  } catch (error) {
    validationErrors.value = ['Failed to format SRT: Invalid format']
  }
}

function parseSRTToSegments(srtContent: string): SubtitleSegment[] {
  const segments: SubtitleSegment[] = []
  const blocks = srtContent.trim().split('\n\n')

  blocks.forEach((block, index) => {
    const lines = block.trim().split('\n')
    if (lines.length >= 3) {
      const timestampLine = lines[1]
      const textLines = lines.slice(2)

      const timestampMatch = timestampLine.match(
        /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
      )
      if (timestampMatch) {
        const startTime = timestampMatch[1]
        const endTime = timestampMatch[2]
        const text = textLines.join(' ').trim()

        // Convert timestamp to seconds for compatibility
        const startSeconds = parseTimestamp(startTime)
        const endSeconds = parseTimestamp(endTime)

        segments.push({
          index: index + 1,
          startTime,
          endTime,
          text,
          timestamp: [startSeconds, endSeconds],
        })
      }
    }
  })

  return segments
}

function parseTimestamp(timestamp: string): number {
  const [time, ms] = timestamp.split(',')
  const [hours, minutes, seconds] = time.split(':').map(Number)
  return hours * 3600 + minutes * 60 + seconds + parseInt(ms) / 1000
}

function downloadTranscriptionSRT() {
  if (transcriptionSRT.value) {
    downloadSRT(transcriptionSRT.value, 'transcription.srt')
  }
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

function getTranscriptionStageText(): string {
  const stage = transcriptionStage.value
  const progress = transcriptionProgress.value
  const chunks = chunkInfo.value

  if (stage === 'preparing') return 'Preparing audio for transcription...'
  if (stage === 'loading') return 'Loading audio data...'
  if (stage === 'processing') {
    if (chunks && chunks.totalChunks > 0) {
      return `Processing ${chunks.totalChunks} audio chunks...`
    }
    return `Processing audio segments... ${progress}%`
  }
  if (stage === 'finalizing') return 'Finalizing transcription results...'
  if (stage === 'complete') return 'Transcription complete!'

  return 'Converting speech to text...'
}

function formatProgressItemName(file: string): string {
  // Extract readable name from file path (whisper-web style)
  const parts = file.split('/')
  const fileName = parts[parts.length - 1]
  return fileName.replace(/\.[^/.]+$/, '') // Remove extension
}

function goToStep3() {
  router.push('/step-3')
}
</script>
