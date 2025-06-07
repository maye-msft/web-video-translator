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

      <!-- Source Subtitles Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Source Subtitles</h2>

        <!-- Show transcription from Step 2 -->
        <div
          v-if="hasTranscription"
          class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
        >
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
                Using transcription from Step 2 ({{
                  transcriptionSegments.length
                }}
                segments)
              </span>
            </div>
            <button
              @click="showSourcePreview = !showSourcePreview"
              class="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {{ showSourcePreview ? 'Hide' : 'Show' }} Preview
            </button>
          </div>

          <!-- Source Preview -->
          <div
            v-if="showSourcePreview"
            class="mt-4 p-3 bg-white rounded border"
          >
            <div class="text-sm text-gray-600 max-h-32 overflow-y-auto">
              <pre class="whitespace-pre-wrap font-mono">{{
                sourceContentPreview
              }}</pre>
            </div>
          </div>
        </div>

        <!-- Alternative: Upload SRT -->
        <div v-if="!hasTranscription" class="mb-4">
          <p class="text-gray-600 mb-4">
            Upload subtitle files to translate. Supports SRT format and plain
            text.
          </p>
          <SRTInput @content-changed="handleSourceSRTUpload" />
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

        <!-- Side-by-side comparison -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Original -->
          <div class="border rounded-lg">
            <div class="p-4 border-b bg-gray-50">
              <h3 class="font-medium">
                Original ({{ getLanguageName(sourceLanguage) }})
              </h3>
            </div>
            <div class="p-4">
              <textarea
                :value="originalSRT"
                readonly
                class="w-full h-64 font-mono text-sm border-0 resize-none focus:ring-0 bg-gray-50"
              ></textarea>
            </div>
          </div>

          <!-- Translation -->
          <div class="border rounded-lg">
            <div class="p-4 border-b bg-gray-50">
              <h3 class="font-medium">
                Translation ({{ getLanguageName(targetLanguage) }})
              </h3>
            </div>
            <div class="p-4">
              <textarea
                v-model="translatedSRT"
                @input="handleTranslationEdit"
                class="w-full h-64 font-mono text-sm border-0 resize-none focus:ring-0"
                placeholder="Translation will appear here..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Alternative: Upload Translated SRT -->
      <div v-if="!translatedSRT && hasSourceContent" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">
          Or Upload Existing Translation
        </h2>
        <p class="text-gray-600 mb-4">
          Skip translation by uploading an existing translated subtitle file.
        </p>
        <SRTInput @content-changed="handleTranslatedSRTUpload" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SRTInput from '@/components/SRTInput.vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import {
  MARIAN_MODELS,
  findModelsForLanguagePair,
  generateTranslatedSRT,
  downloadTranslatedSRT,
  SUPPORTED_LANGUAGES,
  parseSRT,
} from '@/utils/translation'
import { translationService } from '@/services/translationService'
import type { SubtitleSegment } from '@/utils/translation'

const { workflowState, updateArtifacts, setProcessing, completeStep } =
  useWorkflowState()

// UI state
const showHelp = ref<boolean>(false)

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
const showSourcePreview = ref<boolean>(false)

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

// Initialize source content from Step 2 if available
if (hasTranscription.value && !originalSRT.value) {
  originalSRT.value = workflowState.artifacts.transcriptionSRT
}

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

function handleTranslatedSRTUpload(
  segments: SubtitleSegment[],
  rawContent: string
) {
  translatedSRT.value = rawContent
  translationSegments.value = segments

  updateArtifacts({
    translatedSRT: rawContent,
    translationSegments: segments,
  })
}

function handleTranslationEdit() {
  // Update workflow state when user edits translation
  updateArtifacts({
    translatedSRT: translatedSRT.value,
  })
}

async function startTranslation() {
  if (
    !hasSourceContent.value ||
    !availableModel.value ||
    sourceLanguage.value === targetLanguage.value
  ) {
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

    // Parse SRT content first
    const segments = parseSRT(originalSRT.value)

    if (segments.length === 0) {
      throw new Error('No valid subtitle segments found')
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
    downloadTranslatedSRT(translatedSRT.value, filename)
  }
}
</script>
