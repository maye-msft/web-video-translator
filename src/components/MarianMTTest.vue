<!-- MarianMT Translation Test Component -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          MarianMT Translation Test
        </h1>
        <p class="text-gray-600">
          Test neural machine translation with MarianMT models for subtitle
          translation.
        </p>
      </div>

      <!-- Model Selection Section -->
      <div class="bg-white rounded-lg shadow-sm border mb-6 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          1. Select Translation Model
        </h2>

        <!-- Language Pair Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Source Language</label
            >
            <select
              v-model="sourceLanguage"
              @change="updateAvailableModels"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select source language</option>
              <option
                v-for="[code, name] in Object.entries(SUPPORTED_LANGUAGES)"
                :key="code"
                :value="code"
              >
                {{ name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Target Language</label
            >
            <select
              v-model="targetLanguage"
              @change="updateAvailableModels"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select target language</option>
              <option
                v-for="[code, name] in Object.entries(SUPPORTED_LANGUAGES)"
                :key="code"
                :value="code"
              >
                {{ name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Available Models -->
        <div v-if="availableModels.length > 0" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Available Models</label
          >
          <div class="space-y-2">
            <label
              v-for="model in availableModels"
              :key="model.id"
              class="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
              :class="{
                'border-blue-500 bg-blue-50': selectedModelId === model.id,
              }"
            >
              <input
                type="radio"
                :value="model.id"
                v-model="selectedModelId"
                class="mr-3"
              />
              <div class="flex-1">
                <div class="font-medium">{{ model.name }}</div>
                <div class="text-sm text-gray-500">
                  {{ model.description }} • {{ model.size }}
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Load Model Button -->
        <button
          @click="loadModel"
          :disabled="!selectedModelId || isLoading"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {{ isLoading ? 'Loading Model...' : 'Load Translation Model' }}
        </button>

        <!-- Model Loading Progress -->
        <div v-if="modelProgress.progress > 0" class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>{{ modelProgress.message }}</span>
            <span>{{ modelProgress.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${modelProgress.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Model Status -->
        <div
          v-if="currentModel"
          class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md"
        >
          <div class="flex items-center">
            <svg
              class="w-5 h-5 text-green-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="text-green-800 font-medium"
              >Model Ready: {{ currentModel }}</span
            >
          </div>
        </div>
      </div>

      <!-- SRT Input Section -->
      <div class="bg-white rounded-lg shadow-sm border mb-6 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          2. Input Subtitles
        </h2>
        <SRTInput
          @content-changed="handleSRTLoaded"
          :disabled="isTranslating"
          class="mb-4"
        />

        <!-- Parsed Subtitles Preview -->
        <div v-if="parsedSubtitles.length > 0" class="mt-4">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Parsed Subtitles ({{ parsedSubtitles.length }} segments)
          </h3>
          <div
            class="max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50"
          >
            <div
              v-for="subtitle in parsedSubtitles.slice(0, 5)"
              :key="subtitle.index"
              class="mb-2 text-sm"
            >
              <span class="font-mono text-blue-600"
                >{{ subtitle.startTime }} → {{ subtitle.endTime }}</span
              >
              <div class="text-gray-800">{{ subtitle.text }}</div>
            </div>
            <div
              v-if="parsedSubtitles.length > 5"
              class="text-sm text-gray-500 mt-2"
            >
              ... and {{ parsedSubtitles.length - 5 }} more segments
            </div>
          </div>
        </div>
      </div>

      <!-- Translation Section -->
      <div class="bg-white rounded-lg shadow-sm border mb-6 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          3. Translate Subtitles
        </h2>

        <button
          @click="translateSubtitles"
          :disabled="!canTranslate || isTranslating"
          class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {{ isTranslating ? 'Translating...' : 'Translate Subtitles' }}
        </button>

        <!-- Translation Progress -->
        <div v-if="translationProgress.progress > 0" class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>{{ translationProgress.message }}</span>
            <span>{{ translationProgress.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-green-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${translationProgress.progress}%` }"
            ></div>
          </div>
          <div
            v-if="translationProgress.currentSegment"
            class="text-xs text-gray-500 mt-1"
          >
            Segment {{ translationProgress.currentSegment }} of
            {{ translationProgress.totalSegments }}
          </div>
        </div>

        <!-- Translation Results -->
        <div v-if="translationResult" class="mt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-3">
            Translation Results
          </h3>

          <!-- Results Summary -->
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div class="font-medium text-blue-900">Total Segments</div>
                <div class="text-blue-700">
                  {{ translationResult.totalSegments }}
                </div>
              </div>
              <div>
                <div class="font-medium text-blue-900">
                  Successfully Translated
                </div>
                <div class="text-blue-700">
                  {{ translationResult.successfulTranslations }}
                </div>
              </div>
              <div>
                <div class="font-medium text-blue-900">Processing Time</div>
                <div class="text-blue-700">
                  {{ Math.round(translationResult.processingTime / 1000) }}s
                </div>
              </div>
              <div>
                <div class="font-medium text-blue-900">Model Used</div>
                <div class="text-blue-700">
                  {{ translationResult.modelUsed }}
                </div>
              </div>
            </div>
          </div>

          <!-- Side-by-side comparison -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Original Subtitles -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Original Subtitles</h4>
              <div
                class="max-h-80 overflow-y-auto border rounded-md p-3 bg-gray-50"
              >
                <div
                  v-for="subtitle in parsedSubtitles.slice(0, 10)"
                  :key="subtitle.index"
                  class="mb-3 text-sm"
                >
                  <div class="font-mono text-blue-600 text-xs">
                    {{ subtitle.startTime }} → {{ subtitle.endTime }}
                  </div>
                  <div class="text-gray-800">{{ subtitle.text }}</div>
                </div>
              </div>
            </div>

            <!-- Translated Subtitles -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                Translated Subtitles
              </h4>
              <div
                class="max-h-80 overflow-y-auto border rounded-md p-3 bg-green-50"
              >
                <div
                  v-for="(
                    translatedText, index
                  ) in translationResult.translatedTexts.slice(0, 10)"
                  :key="index"
                  class="mb-3 text-sm"
                >
                  <div class="font-mono text-blue-600 text-xs">
                    {{ parsedSubtitles[index]?.startTime }} →
                    {{ parsedSubtitles[index]?.endTime }}
                  </div>
                  <div class="text-gray-800">{{ translatedText }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Download Translated SRT -->
          <div class="mt-4">
            <button
              @click="downloadTranslatedSRT"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Download Translated SRT
            </button>
          </div>
        </div>
      </div>

      <!-- Cache Management Section -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Cache Management
        </h2>

        <!-- Cache Info -->
        <div
          v-if="cacheInfo"
          class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
        >
          <div class="bg-gray-50 p-3 rounded-md">
            <div class="text-sm font-medium text-gray-700">
              Total Cache Size
            </div>
            <div class="text-lg font-semibold text-gray-900">
              {{ formatFileSize(cacheInfo.totalSize) }}
            </div>
          </div>
          <div class="bg-gray-50 p-3 rounded-md">
            <div class="text-sm font-medium text-gray-700">Cached Models</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ cacheInfo.modelCount }}
            </div>
          </div>
          <div class="bg-gray-50 p-3 rounded-md">
            <div class="text-sm font-medium text-gray-700">Memory Usage</div>
            <div class="text-lg font-semibold text-gray-900">
              {{
                memoryInfo.usedJSHeapSize
                  ? formatFileSize(memoryInfo.usedJSHeapSize)
                  : 'N/A'
              }}
            </div>
          </div>
        </div>

        <!-- Clear Cache Button -->
        <button
          @click="clearCache"
          :disabled="isClearingCache"
          class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {{
            isClearingCache ? 'Clearing Cache...' : 'Clear Translation Cache'
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SRTInput from './SRTInput.vue'
import { translationService } from '../services/translationService'
import {
  SUPPORTED_LANGUAGES,
  type MarianModel,
  type SubtitleSegment,
  type LanguageCode,
  generateTranslatedSRT,
  getTranslationCacheInfo,
  clearTranslationCache,
  formatFileSize,
  downloadTranslatedSRT as downloadSRT,
  findModelsForLanguagePair,
} from '../utils/translation'

type SupportedLanguage = LanguageCode

// Reactive state
const sourceLanguage = ref('')
const targetLanguage = ref('')
const selectedModelId = ref('')
const availableModels = ref<MarianModel[]>([])
const currentModel = ref('')
const isLoading = ref(false)
const isTranslating = ref(false)
const isClearingCache = ref(false)

const parsedSubtitles = ref<SubtitleSegment[]>([])
const translationResult = ref<any>(null)

const modelProgress = ref({ progress: 0, message: '' })
const translationProgress = ref({
  progress: 0,
  message: '',
  currentSegment: 0,
  totalSegments: 0,
})

const cacheInfo = ref<any>(null)
const memoryInfo = ref<any>({})

// Computed properties
const canTranslate = computed(() => {
  return (
    currentModel.value &&
    parsedSubtitles.value.length > 0 &&
    !isTranslating.value
  )
})

// Methods
const updateAvailableModels = () => {
  if (sourceLanguage.value && targetLanguage.value) {
    availableModels.value = findModelsForLanguagePair(
      sourceLanguage.value as SupportedLanguage,
      targetLanguage.value as SupportedLanguage
    )
    selectedModelId.value =
      availableModels.value.length > 0 ? availableModels.value[0].id : ''
  } else {
    availableModels.value = []
    selectedModelId.value = ''
  }
}

const loadModel = async () => {
  if (!selectedModelId.value) return

  try {
    isLoading.value = true
    modelProgress.value = { progress: 0, message: 'Initializing...' }

    await translationService.initializeModel(
      selectedModelId.value,
      progress => {
        modelProgress.value = {
          progress: typeof progress === 'number' ? progress : progress.progress,
          message: `Loading model... ${typeof progress === 'number' ? progress : progress.progress}%`,
        }
      }
    )

    currentModel.value = selectedModelId.value
    modelProgress.value = {
      progress: 100,
      message: 'Model loaded successfully!',
    }

    // Update cache info
    await updateCacheInfo()
  } catch (error) {
    console.error('Failed to load model:', error)
    alert('Failed to load translation model: ' + (error as Error).message)
  } finally {
    isLoading.value = false
  }
}

const handleSRTLoaded = (segments: SubtitleSegment[]) => {
  parsedSubtitles.value = segments
  translationResult.value = null
}

const translateSubtitles = async () => {
  if (!canTranslate.value) return

  try {
    isTranslating.value = true
    translationProgress.value = {
      progress: 0,
      message: 'Starting translation...',
      currentSegment: 0,
      totalSegments: parsedSubtitles.value.length,
    }

    const texts = parsedSubtitles.value.map(sub => sub.text)

    const result = await translationService.translateText(
      texts,
      {
        sourceLanguage: sourceLanguage.value as string,
        targetLanguage: targetLanguage.value as string,
        maxLength: 512,
      },
      progress => {
        translationProgress.value = {
          progress: typeof progress === 'number' ? progress : progress.progress,
          message: `Translating... ${typeof progress === 'number' ? progress : progress.progress}%`,
          currentSegment: Math.round(
            ((typeof progress === 'number' ? progress : progress.progress) /
              100) *
              parsedSubtitles.value.length
          ),
          totalSegments: parsedSubtitles.value.length,
        }
      }
    )

    translationResult.value = result
    translationProgress.value = {
      progress: 100,
      message: 'Translation completed!',
      currentSegment: parsedSubtitles.value.length,
      totalSegments: parsedSubtitles.value.length,
    }
  } catch (error) {
    console.error('Translation failed:', error)
    alert('Translation failed: ' + (error as Error).message)
  } finally {
    isTranslating.value = false
  }
}

const downloadTranslatedSRT = () => {
  if (!translationResult.value) return

  const translatedSRTContent = generateTranslatedSRT(
    parsedSubtitles.value,
    translationResult.value.translatedTexts
  )

  const filename = `translated-${sourceLanguage.value}-to-${targetLanguage.value}-subtitles.srt`

  downloadSRT(translatedSRTContent, filename)
}

const updateCacheInfo = async () => {
  try {
    cacheInfo.value = await getTranslationCacheInfo()
    memoryInfo.value = await translationService.getMemoryInfo()
  } catch (error) {
    console.error('Failed to get cache info:', error)
  }
}

const clearCache = async () => {
  if (!confirm('This will clear all cached translation models. Continue?'))
    return

  try {
    isClearingCache.value = true
    await clearTranslationCache()
    await updateCacheInfo()
    alert('Translation cache cleared successfully!')
  } catch (error) {
    console.error('Failed to clear cache:', error)
    alert('Failed to clear cache: ' + (error as Error).message)
  } finally {
    isClearingCache.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await updateCacheInfo()
})

onUnmounted(() => {
  // Clean up translation service
  translationService.cleanup()
})
</script>
