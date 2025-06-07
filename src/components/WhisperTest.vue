<template>
  <div class="container mx-auto px-4 py-8">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Whisper Speech-to-Text Test
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Test Whisper AI model functionality by uploading audio files and
        generating subtitles in SRT format. This page validates speech-to-text
        transcription and subtitle generation capabilities.
      </p>
    </header>

    <main class="max-w-6xl mx-auto">
      <!-- Model Management Section -->
      <section class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          Whisper Model Management
        </h2>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Model Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Whisper Model
            </label>
            <select
              v-model="selectedModelName"
              :disabled="isModelLoading"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option
                v-for="model in availableModels"
                :key="model.name"
                :value="model.name"
              >
                {{ model.displayName }} ({{ model.size }})
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              {{ getSelectedModelDescription() }}
            </p>
          </div>

          <!-- Model Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Model Status
            </label>
            <div class="space-y-2">
              <div class="flex items-center">
                <div
                  class="w-3 h-3 rounded-full mr-2"
                  :class="modelStatusIndicatorClass"
                ></div>
                <span class="text-sm font-medium">{{ modelStatusText }}</span>
              </div>

              <button
                v-if="!modelStatus.loaded && !modelStatus.loading"
                @click="loadModel"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Load Model
              </button>
            </div>
          </div>
        </div>

        <!-- Model Loading Progress -->
        <div v-if="modelStatus.loading" class="mt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600"
              >Loading {{ selectedModelName }}...</span
            >
            <span class="text-sm font-medium text-gray-800"
              >{{ Math.round(modelLoadProgress.progress) }}%</span
            >
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${modelLoadProgress.progress}%` }"
            ></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ formatFileSize(modelLoadProgress.loaded) }} /
            {{ formatFileSize(modelLoadProgress.total) }}
          </div>
        </div>

        <!-- Model Error -->
        <div
          v-if="modelStatus.error"
          class="mt-4 bg-red-50 border border-red-200 rounded-md p-3"
        >
          <div class="flex">
            <svg
              class="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="ml-2">
              <h4 class="text-sm font-medium text-red-800">
                Model Loading Error
              </h4>
              <p class="text-sm text-red-700 mt-1">{{ modelStatus.error }}</p>
            </div>
          </div>
        </div>

        <!-- Cache Management -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-800">Cache Management</h3>
            <button
              @click="refreshCacheInfo"
              :disabled="isRefreshingCache"
              class="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {{ isRefreshingCache ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Cache Size:</span>
              <span class="font-medium ml-2">{{
                formatFileSize(cacheInfo.totalSize)
              }}</span>
            </div>
            <div>
              <span class="text-gray-600">Models Cached:</span>
              <span class="font-medium ml-2">{{ cacheInfo.modelCount }}</span>
            </div>
          </div>

          <button
            @click="showClearCacheConfirm = true"
            :disabled="isModelLoading || cacheInfo.totalSize === 0"
            class="mt-3 bg-red-600 text-white px-4 py-2 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Cache
          </button>
        </div>
      </section>

      <!-- Audio Upload and Processing -->
      <section class="mb-8">
        <AudioUpload
          @file-selected="handleAudioSelected"
          @file-cleared="handleAudioCleared"
          @error="handleUploadError"
        />
      </section>

      <!-- Transcription Controls -->
      <section
        v-if="selectedAudio"
        class="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          Transcription Settings
        </h2>

        <div class="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Task
            </label>
            <select
              v-model="transcriptionSettings.task"
              class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="transcribe">Transcribe</option>
              <option value="translate">Translate to English</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              v-model="transcriptionSettings.language"
              class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="italian">Italian</option>
              <option value="portuguese">Portuguese</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
              <option value="auto">Auto-detect</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Chunk Length (seconds)
            </label>
            <select
              v-model="transcriptionSettings.chunkLength"
              class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="10">10 seconds</option>
              <option :value="20">20 seconds</option>
              <option :value="30">30 seconds</option>
              <option :value="60">60 seconds</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col space-y-3">
          <div
            v-if="!isModelLoaded"
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div class="flex">
              <svg
                class="h-5 w-5 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-21 12a9 9 0 1118 0 9 9 0 01-18 0z"
                />
              </svg>
              <div class="ml-2">
                <h4 class="text-sm font-medium text-yellow-800">
                  Model Required
                </h4>
                <p class="text-sm text-yellow-700 mt-1">
                  Please load a Whisper model first before starting
                  transcription.
                </p>
              </div>
            </div>
          </div>

          <div class="flex space-x-4">
            <button
              @click="startTranscription"
              :disabled="!selectedAudio || isTranscribing || !isModelLoaded"
              class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isTranscribing ? 'Transcribing...' : 'Start Transcription' }}
            </button>

            <button
              v-if="isTranscribing"
              @click="cancelTranscription"
              class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Transcription Progress -->
        <div
          v-if="isTranscribing"
          class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"
              ></div>
              <span class="text-sm font-medium text-blue-800"
                >Processing audio...</span
              >
            </div>
            <span class="text-lg font-bold text-blue-800"
              >{{ transcriptionProgress }}%</span
            >
          </div>
          <div class="w-full bg-blue-200 rounded-full h-3 mb-2">
            <div
              class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${transcriptionProgress}%` }"
            ></div>
          </div>
          <div class="text-xs text-blue-600 text-center">
            This may take several minutes depending on audio length and model
            size
          </div>
        </div>

        <!-- Transcription Error -->
        <div
          v-if="transcriptionError"
          class="mt-4 bg-red-50 border border-red-200 rounded-md p-3"
        >
          <div class="flex">
            <svg
              class="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="ml-2">
              <h4 class="text-sm font-medium text-red-800">
                Transcription Error
              </h4>
              <p class="text-sm text-red-700 mt-1">{{ transcriptionError }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section
        v-if="transcriptionResult"
        class="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800">
            Transcription Results
          </h2>
          <div class="space-x-2">
            <button
              @click="downloadSRTFile"
              class="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
            >
              Download SRT
            </button>
            <button
              @click="copyToClipboard"
              class="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Copy SRT
            </button>
          </div>
        </div>

        <!-- Subtitle Editor -->
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Raw Transcription
            </label>
            <textarea
              :value="transcriptionResult.text"
              readonly
              class="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none bg-gray-50 text-sm font-mono"
              placeholder="Transcription text will appear here..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              SRT Format
            </label>
            <textarea
              v-model="editableSRT"
              class="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="SRT format subtitles will appear here..."
            ></textarea>
          </div>
        </div>

        <!-- Subtitle Timeline -->
        <div class="mt-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">
            Subtitle Timeline
          </h4>
          <div
            class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg"
          >
            <div
              v-for="(chunk, index) in transcriptionResult.chunks"
              :key="index"
              class="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <div
                class="flex items-center justify-between text-xs text-gray-500 mb-1"
              >
                <span
                  >{{ formatTimestamp(chunk.timestamp[0]) }} →
                  {{ formatTimestamp(chunk.timestamp[1]) }}</span
                >
                <span
                  >{{
                    (chunk.timestamp[1] - chunk.timestamp[0]).toFixed(1)
                  }}s</span
                >
              </div>
              <div class="text-sm text-gray-800">{{ chunk.text.trim() }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Instructions -->
      <section class="bg-blue-50 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-blue-900 mb-4">How to Use</h2>
        <ol class="list-decimal list-inside space-y-2 text-blue-800">
          <li>
            Select a Whisper model (Small Multilingual is recommended and
            pre-selected)
          </li>
          <li>Click "Load Model" and wait for the download to complete</li>
          <li>Upload an audio file (MP3, WAV, M4A, OGG, or FLAC)</li>
          <li>
            Configure transcription settings (task, language, chunk length)
          </li>
          <li>Click "Start Transcription" to process the audio</li>
          <li>Review and edit the generated subtitles</li>
          <li>Download the SRT file or copy to clipboard</li>
        </ol>

        <div class="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
          <h4 class="text-sm font-medium text-blue-900 mb-1">
            Model Recommendations:
          </h4>
          <ul class="text-xs text-blue-800 space-y-1">
            <li>
              <strong>Small (Multilingual):</strong> Good accuracy, reasonable
              size (recommended for most users)
            </li>
            <li>
              <strong>Medium (Multilingual):</strong> High accuracy, larger
              download (~770MB)
            </li>
            <li>
              <strong>Large v3 (Multilingual):</strong> Highest accuracy, very
              large download (~1.5GB)
            </li>
            <li>
              <strong>Large v3 Turbo:</strong> Optimized large model, faster
              than regular large (~810MB)
            </li>
            <li>
              <strong>Base models:</strong> Faster processing but lower accuracy
            </li>
            <li>
              <strong>English-only models:</strong> Faster for English content,
              no other language support
            </li>
          </ul>
        </div>

        <div class="mt-3 p-3 bg-amber-50 rounded border border-amber-200">
          <h4 class="text-sm font-medium text-amber-800 mb-1">
            ⚠️ Large Model Notice:
          </h4>
          <p class="text-xs text-amber-700">
            Medium and Large models require significant download time and
            storage space. Ensure you have a stable internet connection and
            sufficient disk space before downloading. Large models may also
            require more processing time and memory.
          </p>
        </div>

        <div class="mt-3 p-3 bg-green-50 rounded border border-green-200">
          <h4 class="text-sm font-medium text-green-800 mb-1">
            ✨ Performance Enhancement:
          </h4>
          <p class="text-xs text-green-700">
            This app now uses Web Workers for background processing! The page
            will remain responsive during transcription, and you can cancel
            operations at any time.
          </p>
        </div>
      </section>
    </main>

    <!-- Clear Cache Confirmation Modal -->
    <div
      v-if="showClearCacheConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Clear Model Cache
        </h3>
        <p class="text-sm text-gray-600 mb-4">
          This will remove all cached Whisper models and free up storage space.
          You will need to re-download models after clearing the cache.
        </p>
        <p class="text-sm text-gray-800 font-medium mb-4">
          Current cache size: {{ formatFileSize(cacheInfo.totalSize) }}
        </p>
        <div class="flex space-x-3">
          <button
            @click="clearCache"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Clear Cache
          </button>
          <button
            @click="showClearCacheConfirm = false"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AudioUpload from './AudioUpload.vue'
import {
  WHISPER_MODELS,
  preprocessAudio,
  generateSRT,
  downloadSRT,
  getCacheInfo,
  clearModelCache,
  type TranscriptionResult,
  type CacheInfo,
} from '../utils/whisper'
import { whisperService } from '../services/whisperService'

// State
const selectedAudio = ref<File | null>(null)
const selectedModelName = ref('Xenova/whisper-small')
const availableModels = ref(WHISPER_MODELS)

const modelStatus = ref({
  loaded: false,
  loading: false,
  error: null as string | null,
})

const modelLoadProgress = ref({
  progress: 0,
  loaded: 0,
  total: 0,
})

const transcriptionSettings = ref({
  task: 'transcribe' as 'transcribe' | 'translate',
  language: 'english',
  chunkLength: 30,
})

const isTranscribing = ref(false)
const transcriptionProgress = ref(0)
const transcriptionError = ref('')
const transcriptionResult = ref<TranscriptionResult | null>(null)
const editableSRT = ref('')
const currentRequestId = ref<string | null>(null)

const cacheInfo = ref<CacheInfo>({
  totalSize: 0,
  modelCount: 0,
  models: [],
})

const isRefreshingCache = ref(false)
const showClearCacheConfirm = ref(false)

// Computed
const modelStatusIndicatorClass = computed(() => ({
  'bg-red-500': modelStatus.value.error,
  'bg-yellow-500': modelStatus.value.loading,
  'bg-green-500': modelStatus.value.loaded,
  'bg-gray-400':
    !modelStatus.value.loaded &&
    !modelStatus.value.loading &&
    !modelStatus.value.error,
}))

const modelStatusText = computed(() => {
  if (modelStatus.value.error) return 'Error'
  if (modelStatus.value.loading) return 'Loading...'
  if (modelStatus.value.loaded)
    return `Ready (${whisperService.getCurrentModelName()})`
  return 'Not Loaded'
})

const isModelLoading = computed(() => modelStatus.value.loading)
const isModelLoaded = computed(() => modelStatus.value.loaded)

// Methods
const getSelectedModelDescription = () => {
  const model = availableModels.value.find(
    m => m.name === selectedModelName.value
  )
  return model?.description || ''
}

const loadModel = async () => {
  modelStatus.value.loading = true
  modelStatus.value.error = null
  modelLoadProgress.value = { progress: 0, loaded: 0, total: 0 }

  try {
    await whisperService.initializeWhisper(
      selectedModelName.value,
      progress => {
        modelLoadProgress.value = progress
      }
    )

    modelStatus.value.loaded = true
    modelStatus.value.loading = false
  } catch (error) {
    modelStatus.value.error =
      error instanceof Error ? error.message : 'Unknown error'
    modelStatus.value.loading = false
  }
}

const handleAudioSelected = (file: File) => {
  selectedAudio.value = file
  transcriptionResult.value = null
  editableSRT.value = ''
  transcriptionError.value = ''
}

const handleAudioCleared = () => {
  selectedAudio.value = null
  transcriptionResult.value = null
  editableSRT.value = ''
  transcriptionError.value = ''
}

const handleUploadError = (error: string) => {
  transcriptionError.value = error
}

const startTranscription = async () => {
  if (!selectedAudio.value || !modelStatus.value.loaded) return

  isTranscribing.value = true
  transcriptionProgress.value = 0
  transcriptionError.value = ''
  transcriptionResult.value = null

  try {
    // Preprocess audio (still on main thread as it's quick)
    const audioData = await preprocessAudio(selectedAudio.value)

    // Start transcription and immediately get the request ID for cancellation
    const transcriptionPromise = whisperService.transcribeAudio(
      audioData,
      {
        task: transcriptionSettings.value.task,
        language:
          transcriptionSettings.value.language === 'auto'
            ? undefined
            : transcriptionSettings.value.language,
        return_timestamps: true,
        chunk_length_s: transcriptionSettings.value.chunkLength,
      },
      progress => {
        console.log('Received transcription progress in UI:', progress)
        transcriptionProgress.value = Math.round(progress)
      }
    )

    // Store the current request ID for cancellation
    currentRequestId.value = whisperService.getCurrentTranscriptionId()

    // Wait for transcription to complete
    const result = await transcriptionPromise

    transcriptionResult.value = result
    editableSRT.value = generateSRT(result)
  } catch (error) {
    if (error instanceof Error && error.message.includes('cancelled')) {
      transcriptionError.value = 'Transcription was cancelled by user'
    } else {
      transcriptionError.value =
        error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    isTranscribing.value = false
    transcriptionProgress.value = 0
    currentRequestId.value = null
  }
}

const cancelTranscription = () => {
  if (currentRequestId.value) {
    whisperService.cancelOperation(currentRequestId.value)
  } else {
    whisperService.cancelOperation() // Cancel all operations
  }
}

const downloadSRTFile = () => {
  if (editableSRT.value) {
    const filename = selectedAudio.value
      ? selectedAudio.value.name.replace(/\.[^/.]+$/, '.srt')
      : 'subtitles.srt'
    downloadSRT(editableSRT.value, filename)
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(editableSRT.value)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

const refreshCacheInfo = async () => {
  isRefreshingCache.value = true
  try {
    cacheInfo.value = await getCacheInfo()
  } catch (error) {
    console.error('Failed to get cache info:', error)
  } finally {
    isRefreshingCache.value = false
  }
}

const clearCache = async () => {
  try {
    await clearModelCache()
    whisperService.cleanup()
    modelStatus.value.loaded = false
    modelStatus.value.error = null
    await refreshCacheInfo()
    showClearCacheConfirm.value = false
  } catch (error) {
    modelStatus.value.error =
      error instanceof Error ? error.message : 'Failed to clear cache'
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTimestamp = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

// Initialize
onMounted(async () => {
  // Check if model is already loaded
  if (whisperService.isModelLoaded()) {
    modelStatus.value.loaded = true
  }

  // Load cache info
  await refreshCacheInfo()
})

// Cleanup
onUnmounted(() => {
  // Cancel any ongoing operations
  if (isTranscribing.value) {
    cancelTranscription()
  }
})
</script>
