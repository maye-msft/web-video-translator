<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">
          Step 3: Translate Subtitles
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
        Translate your subtitles to the target language using AI translation.
        Choose your source and target languages and generate high-quality
        translations.
      </p>

      <!-- Help Section -->
      <div
        v-if="showHelp"
        class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <h3 class="text-lg font-semibold text-blue-900 mb-3">Step 3 Guide</h3>
        <div class="space-y-2 text-sm text-blue-800">
          <p><strong>What happens in this step:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Select source and target languages</li>
            <li>Use AI to translate subtitle text</li>
            <li>Preserve original timing and formatting</li>
            <li>Review and edit translations manually if needed</li>
          </ul>
          <p class="mt-3"><strong>Language Support:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>40+ language pairs supported</li>
            <li>High-quality neural machine translation</li>
            <li>Context-aware translation for subtitles</li>
          </ul>
          <p class="mt-3">
            <strong>Tips:</strong> Review translations for accuracy, especially
            for technical terms or proper names.
          </p>
        </div>
      </div>

      <!-- Source Subtitles Selection Panel -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Choose Source Subtitles</h2>
        
        <!-- Combined Source Selection Panel -->
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Option 1: Use Step 2 Transcription -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="sourceOption"
                  type="radio"
                  value="step2"
                  :disabled="!hasTranscription"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Use Subtitles from Step 2
                </span>
              </label>
              <div v-if="hasTranscription" class="flex items-center text-sm text-green-600">
                <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ transcriptionSegments.length }} segments available
              </div>
            </div>
            
            <div v-if="hasTranscription && sourceOption === 'step2'" class="ml-7">
              <div class="bg-white border rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-700">Preview:</span>
                  <button
                    @click="showStep2Preview = !showStep2Preview"
                    class="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {{ showStep2Preview ? 'Hide' : 'Show' }} Full Content
                  </button>
                </div>
                <div class="text-sm text-gray-600">
                  <pre v-if="showStep2Preview" class="whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">{{ workflowState.artifacts.transcriptionSRT }}</pre>
                  <pre v-else class="whitespace-pre-wrap font-mono">{{ sourceContentPreview }}</pre>
                </div>
              </div>
            </div>
            
            <div v-if="!hasTranscription" class="ml-7 text-sm text-gray-500">
              No subtitles available from Step 2. Complete Step 2 first or upload subtitles below.
            </div>
          </div>
          
          <!-- Option 2: Upload SRT File -->
          <div>
            <div class="flex items-center mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="sourceOption"
                  type="radio"
                  value="upload"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Upload Subtitle File
                </span>
              </label>
            </div>
            
            <div v-if="sourceOption === 'upload'" class="ml-7">
              <p class="text-sm text-gray-600 mb-3">
                Upload your own SRT subtitle file to translate. Supports SRT format and plain text.
              </p>
              <SRTInput @content-changed="handleSourceSRTUpload" />
            </div>
          </div>
        </div>
      </div>

      <!-- Language Selection -->
      <div v-if="hasSourceContent" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Language Settings</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Source Language -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Source Language
            </label>
            <select
              v-model="sourceLanguage"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="lang in supportedLanguages"
                :key="lang.code"
                :value="lang.code"
              >
                {{ lang.name }}
              </option>
            </select>
          </div>

          <!-- Target Language -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              v-model="targetLanguage"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="lang in supportedLanguages"
                :key="lang.code"
                :value="lang.code"
              >
                {{ lang.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Available Model Info -->
        <div
          v-if="availableModel"
          class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-center">
            <svg
              class="h-5 w-5 text-blue-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <span class="text-sm font-medium text-blue-800">
                Translation Model: {{ availableModel.name }}
              </span>
              <span class="text-xs text-blue-600 ml-2"
                >({{ availableModel.size }})</span
              >
            </div>
          </div>
        </div>

        <!-- No Model Available Warning -->
        <div
          v-if="!availableModel && sourceLanguage !== targetLanguage"
          class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div class="flex items-center">
            <svg
              class="h-5 w-5 text-yellow-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span class="text-sm text-yellow-800">
              No translation model available for
              {{ getLanguageName(sourceLanguage) }} →
              {{ getLanguageName(targetLanguage) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Translation Section -->
      <div v-if="hasSourceContent && availableModel" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Generate Translation</h2>
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Translate Button -->
          <button
            @click="startTranslation"
            :disabled="
              isTranslating ||
              isModelLoading ||
              sourceLanguage === targetLanguage
            "
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {{ getTranslateButtonText }}
          </button>

          <!-- Model Loading Progress -->
          <div v-if="isModelLoading" class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span>Loading {{ availableModel.name }} model...</span>
              <span>{{ modelLoadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: modelLoadProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Translation Progress -->
          <div v-if="isTranslating" class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span>{{ translationStatus }}</span>
              <span>{{ translationProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: translationProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Error Display -->
          <div
            v-if="translationError"
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
                  Translation Error
                </h3>
                <p class="mt-1 text-sm text-red-700">{{ translationError }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Translation Results -->
      <div v-if="translatedSRT" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Translation Results</h2>
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
                Translation complete ({{ getLanguageName(sourceLanguage) }} →
                {{ getLanguageName(targetLanguage) }})
              </span>
            </div>
            <button
              @click="downloadTranslatedSRT"
              class="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Download SRT
            </button>
          </div>
        </div>

        <!-- Advanced Translation Editor -->
        <div class="border rounded-lg">
          <div class="p-4 border-b bg-gray-50">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">Translation Editor</h3>
              <div class="flex items-center space-x-3">
                <span class="text-xs text-gray-500">
                  {{ getSegmentCount() }} segments | {{ getWordCount() }} words
                </span>
                <button
                  @click="validateTranslation"
                  class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Validate
                </button>
                <button
                  @click="formatTranslation"
                  class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                >
                  Format
                </button>
                <button
                  @click="showComparison = !showComparison"
                  class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  {{ showComparison ? 'Hide' : 'Show' }} Original
                </button>
              </div>
            </div>
          </div>
          
          <!-- Side-by-side or single editor view -->
          <div :class="showComparison ? 'grid grid-cols-2 gap-0' : ''">
            <!-- Original (only shown in comparison mode) -->
            <div v-if="showComparison" class="border-r">
              <div class="p-3 border-b bg-gray-100">
                <h4 class="text-sm font-medium text-gray-700">
                  Original ({{ getLanguageName(sourceLanguage) }})
                </h4>
              </div>
              <div class="p-4">
                <textarea
                  :value="originalSRT"
                  readonly
                  class="w-full h-80 font-mono text-sm border-0 resize-none focus:ring-0 focus:outline-none bg-gray-50 leading-relaxed"
                ></textarea>
              </div>
            </div>

            <!-- Translation Editor -->
            <div class="relative">
              <div v-if="showComparison" class="p-3 border-b bg-blue-50">
                <h4 class="text-sm font-medium text-blue-700">
                  Translation ({{ getLanguageName(targetLanguage) }})
                </h4>
              </div>
              <div class="relative">
                <textarea
                  ref="translationEditor"
                  v-model="translatedSRT"
                  @input="handleTranslationEdit"
                  @keydown="handleEditorKeydown"
                  class="w-full h-80 font-mono text-sm border-0 resize-none focus:ring-0 focus:outline-none p-4 leading-relaxed"
                  placeholder="Translation will appear here...

Format: 
1
00:00:00,000 --> 00:00:05,000
Translated subtitle text here"
                  spellcheck="true"
                ></textarea>
                
                <!-- Auto-save indicator -->
                <div v-if="isAutoSaving" class="absolute top-2 right-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Saving...
                </div>
                <div v-else-if="lastSaved" class="absolute top-2 right-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Saved {{ getTimeAgo(lastSaved) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Validation messages -->
          <div v-if="validationErrors.length > 0" class="p-4 border-t bg-red-50">
            <h4 class="text-sm font-medium text-red-800 mb-2">Translation Validation Errors:</h4>
            <ul class="text-xs text-red-700 space-y-1">
              <li v-for="(error, index) in validationErrors" :key="index">
                • {{ error }}
              </li>
            </ul>
          </div>
          
          <!-- Editor help -->
          <div class="p-4 border-t bg-blue-50">
            <details class="text-sm">
              <summary class="cursor-pointer text-blue-800 font-medium mb-2">Translation Editing Tips</summary>
              <div class="text-blue-700 space-y-1 text-xs">
                <p>• <strong>Format:</strong> Maintain SRT structure: number, timestamps, and translated text</p>
                <p>• <strong>Timestamps:</strong> Keep original timing: 00:00:00,000 --> 00:00:05,000</p>
                <p>• <strong>Shortcuts:</strong> Ctrl+S to save, Show/Hide Original for comparison</p>
                <p>• <strong>Auto-save:</strong> Changes are saved automatically every 3 seconds</p>
                <p>• <strong>Validation:</strong> Check for proper SRT format and segment count</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- Next Step Button -->
      <div v-if="translatedSRT" class="mb-8">
        <div class="flex justify-end">
          <button
            @click="proceedToStep4"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Next: Style & Merge Video</span>
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SRTInput from '@/components/SRTInput.vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import {
  MARIAN_MODELS,
  findModelsForLanguagePair,
  generateTranslatedSRT,
  downloadTranslatedSRT as downloadSRTFile,
  SUPPORTED_LANGUAGES,
  parseSRT,
} from '@/utils/translation'
import { translationService } from '@/services/translationService'
import type { SubtitleSegment } from '@/utils/translation'

const { workflowState, updateArtifacts, setProcessing, completeStep } =
  useWorkflowState()

const router = useRouter()

// UI state
const showHelp = ref<boolean>(false)
const sourceOption = ref<string>(workflowState.artifacts.transcriptionSRT ? 'step2' : 'upload')
const showStep2Preview = ref<boolean>(false)
const showComparison = ref<boolean>(false)

// Editor state
const translationEditor = ref<HTMLTextAreaElement>()
const isAutoSaving = ref<boolean>(false)
const lastSaved = ref<Date | null>(null)
const validationErrors = ref<string[]>([])
const autoSaveTimeout = ref<NodeJS.Timeout | null>(null)

// Reactive state
const sourceLanguage = ref<string>(
  workflowState.artifacts.sourceLanguage || 'en'
)
const targetLanguage = ref<string>(
  workflowState.artifacts.targetLanguage || 'es'
)
const originalSRT = ref<string>(
  workflowState.artifacts.originalSRT ||
    workflowState.artifacts.transcriptionSRT ||
    ''
)
const translatedSRT = ref<string>(workflowState.artifacts.translatedSRT || '')
const translationSegments = ref<SubtitleSegment[]>(
  workflowState.artifacts.translationSegments || []
)

// Processing state
const isModelLoading = ref<boolean>(false)
const modelLoadProgress = ref<number>(0)
const isTranslating = ref<boolean>(false)
const translationProgress = ref<number>(0)
const translationStatus = ref<string>('')
const translationError = ref<string>('')

// Computed properties
const hasTranscription = computed(
  () => workflowState.artifacts.transcriptionSRT !== ''
)
const transcriptionSegments = computed(
  () => workflowState.artifacts.transcriptionSegments || []
)
const hasSourceContent = computed(() => originalSRT.value !== '')

const sourceContentPreview = computed(() => {
  return (
    originalSRT.value.slice(0, 300) +
    (originalSRT.value.length > 300 ? '...' : '')
  )
})

const supportedLanguages = computed(() => [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
])

const availableModel = computed(() => {
  if (sourceLanguage.value === targetLanguage.value) return null
  const models = findModelsForLanguagePair(
    sourceLanguage.value,
    targetLanguage.value
  )
  return models.length > 0 ? models[0] : null
})

const getTranslateButtonText = computed(() => {
  if (isModelLoading.value) return 'Loading Model...'
  if (isTranslating.value) return 'Translating...'
  if (sourceLanguage.value === targetLanguage.value)
    return 'Select Different Languages'
  return `Translate to ${getLanguageName(targetLanguage.value)}`
})

// Initialize source content based on selection
watch(sourceOption, (newOption) => {
  if (newOption === 'step2' && hasTranscription.value) {
    originalSRT.value = workflowState.artifacts.transcriptionSRT
  }
}, { immediate: true })

// Initialize from workflow state on mount
onMounted(() => {
  if (workflowState.artifacts.sourceLanguage) {
    sourceLanguage.value = workflowState.artifacts.sourceLanguage
  }
  if (workflowState.artifacts.targetLanguage) {
    targetLanguage.value = workflowState.artifacts.targetLanguage
  }
  if (workflowState.artifacts.originalSRT) {
    originalSRT.value = workflowState.artifacts.originalSRT
  }
  if (workflowState.artifacts.translatedSRT) {
    translatedSRT.value = workflowState.artifacts.translatedSRT
  }
  if (workflowState.artifacts.translationSegments) {
    translationSegments.value = workflowState.artifacts.translationSegments
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value)
  }
})

// Watch for changes to update workflow state
watch(
  [
    sourceLanguage,
    targetLanguage,
    originalSRT,
    translatedSRT,
    translationSegments,
  ],
  () => {
    updateArtifacts({
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
      originalSRT: originalSRT.value,
      translatedSRT: translatedSRT.value,
      translationSegments: translationSegments.value,
    })

    // Check if step is complete
    if (translatedSRT.value !== '') {
      completeStep(3)
    }
  }
)

// Methods
function getLanguageName(code: string): string {
  const language = supportedLanguages.value.find(lang => lang.code === code)
  return language?.name || code
}

function handleSourceSRTUpload(
  segments: SubtitleSegment[],
  rawContent: string
) {
  originalSRT.value = rawContent
  updateArtifacts({
    originalSRT: rawContent,
  })
}


function handleTranslationEdit() {
  // Clear previous auto-save timeout
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value)
  }
  
  // Clear validation errors when editing
  validationErrors.value = []
  
  // Set up auto-save with 3-second delay
  autoSaveTimeout.value = setTimeout(() => {
    autoSaveTranslation()
  }, 3000)
}

function autoSaveTranslation() {
  isAutoSaving.value = true
  
  // Update workflow state when user edits translation
  updateArtifacts({
    translatedSRT: translatedSRT.value,
  })
  
  // Parse and update segments
  try {
    const segments = parseSRT(translatedSRT.value)
    if (Array.isArray(segments)) {
      translationSegments.value = segments
      updateArtifacts({
        translationSegments: segments,
      })
    }
  } catch (error) {
    console.warn('Failed to parse translation during auto-save:', error)
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
    autoSaveTranslation()
  }
}

function getSegmentCount(): number {
  if (!translatedSRT.value) return 0
  try {
    const segments = parseSRT(translatedSRT.value)
    return Array.isArray(segments) ? segments.length : 0
  } catch {
    return 0
  }
}

function getWordCount(): number {
  if (!translatedSRT.value) return 0
  return translatedSRT.value
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

function validateTranslation() {
  validationErrors.value = []
  
  if (!translatedSRT.value.trim()) {
    validationErrors.value.push('Translation content is empty')
    return
  }
  
  try {
    const segments = parseSRT(translatedSRT.value)
    if (!Array.isArray(segments) || segments.length === 0) {
      validationErrors.value.push('No valid subtitle segments found')
      return
    }
    
    // Check if segment count matches original
    const originalSegments = parseSRT(originalSRT.value)
    if (Array.isArray(originalSegments) && segments.length !== originalSegments.length) {
      validationErrors.value.push(`Segment count mismatch: ${segments.length} translated vs ${originalSegments.length} original`)
    }
    
    // Basic SRT format validation
    const lines = translatedSRT.value.split('\n')
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
        validationErrors.value.push(`Line ${i + 1}: Expected subtitle number ${currentIndex}, found "${lines[i]}"`)
        break
      }
      
      i++
      
      // Check timestamp
      if (i >= lines.length || !lines[i].match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)) {
        validationErrors.value.push(`Line ${i + 1}: Invalid or missing timestamp format`)
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
      validationErrors.value.push('✓ Translation format is valid')
      setTimeout(() => {
        validationErrors.value = []
      }, 3000)
    }
  } catch (error) {
    validationErrors.value.push('Failed to parse translation: Invalid SRT format')
  }
}

function formatTranslation() {
  try {
    const segments = parseSRT(translatedSRT.value)
    if (Array.isArray(segments) && segments.length > 0) {
      const formattedSRT = generateTranslatedSRT(segments, segments.map(s => s.text))
      translatedSRT.value = formattedSRT
      autoSaveTranslation()
    }
  } catch (error) {
    validationErrors.value = ['Failed to format translation: Invalid format']
  }
}

async function startTranslation() {
  if (
    !hasSourceContent.value ||
    !availableModel.value ||
    sourceLanguage.value === targetLanguage.value
  ) {
    return
  }

  // Validate SRT segments before translation
  const segments = parseSRT(originalSRT.value)
  if (!Array.isArray(segments) || segments.length === 0) {
    translationError.value =
      'No valid subtitle segments found. Please check your SRT input or transcription.'
    return
  }

  try {
    setProcessing(true)
    isTranslating.value = true
    translationError.value = ''
    translationProgress.value = 0
    translationStatus.value = 'Preparing translation...'

    // Progress callbacks
    const onModelLoad = (progress: number) => {
      isModelLoading.value = true
      modelLoadProgress.value = progress
      translationStatus.value = `Loading ${availableModel.value?.name} model...`
    }

    const onTranslationProgress = (progress: number) => {
      isModelLoading.value = false
      translationProgress.value = progress
      translationStatus.value = `Translating subtitles... ${progress}%`
    }

    // Initialize translation model
    translationStatus.value = `Loading ${availableModel.value?.name} model...`
    await translationService.initializeModel(
      availableModel.value.id,
      onModelLoad
    )

    // Prepare texts for translation
    const texts = segments.map(segment => segment.text)

    // Start translation
    const result = await translationService.translateText(
      texts,
      {
        sourceLanguage: sourceLanguage.value,
        targetLanguage: targetLanguage.value,
        maxLength: 512,
      },
      onTranslationProgress
    )

    // Generate translated SRT using original segments and translated texts
    const translatedContent = generateTranslatedSRT(
      segments,
      result.translatedTexts
    )
    translatedSRT.value = translatedContent
    translationSegments.value = segments.map((segment, index) => ({
      ...segment,
      text: result.translatedTexts[index] || segment.text,
    }))

    translationStatus.value = 'Translation complete!'
    translationProgress.value = 100
  } catch (error) {
    console.error('Translation failed:', error)
    translationError.value =
      error instanceof Error ? error.message : 'Translation failed'
  } finally {
    isTranslating.value = false
    isModelLoading.value = false
    setProcessing(false)
  }
}

function downloadTranslatedSRT() {
  if (translatedSRT.value) {
    const filename = `translated-${sourceLanguage.value}-to-${targetLanguage.value}-subtitles.srt`
    downloadSRTFile(translatedSRT.value, filename)
  }
}

function proceedToStep4() {
  if (translatedSRT.value) {
    // Mark step 3 as completed
    completeStep(3)
    
    // Navigate to step 4
    router.push('/step-4')
  }
}
</script>
