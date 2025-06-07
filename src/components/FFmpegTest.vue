<template>
  <div class="container mx-auto px-4 py-8">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        FFmpeg WebAssembly Test
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Test FFmpeg WebAssembly functionality by extracting audio from video files.
        This page validates that FFmpeg WASM works correctly in the browser environment.
      </p>
    </header>

    <main class="max-w-4xl mx-auto">
      <!-- FFmpeg Status -->
      <section class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">FFmpeg Status</h2>
        
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :class="statusIndicatorClass"
            ></div>
            <span class="text-sm font-medium">{{ statusText }}</span>
          </div>
          
          <button
            v-if="!ffmpegStatus.loaded && !ffmpegStatus.loading"
            @click="initializeFFmpegHandler"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Initialize FFmpeg
          </button>
        </div>

        <!-- Initialization Progress -->
        <div v-if="ffmpegStatus.loading" class="mb-4">
          <div class="flex items-center mb-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span class="text-sm text-gray-600">Loading FFmpeg WebAssembly...</span>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="ffmpegStatus.error" class="bg-red-50 border border-red-200 rounded-md p-3">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="ml-2">
              <h4 class="text-sm font-medium text-red-800">FFmpeg Error</h4>
              <p class="text-sm text-red-700 mt-1">{{ ffmpegStatus.error }}</p>
            </div>
          </div>
        </div>

        <!-- FFmpeg Logs -->
        <div v-if="logs.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">FFmpeg Logs</h4>
          <div class="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
            <div v-for="(log, index) in logs.slice(-10)" :key="index" class="text-xs font-mono text-gray-600">
              {{ log }}
            </div>
          </div>
        </div>
      </section>

      <!-- Video Upload and Processing -->
      <section class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Audio Extraction Test</h2>
        
        <!-- Video Upload -->
        <div class="mb-6">
          <VideoUpload 
            @file-selected="handleVideoSelected"
            @file-cleared="handleVideoCleared"
            @error="handleUploadError"
          />
        </div>

        <!-- Video Info -->
        <VideoInfo v-if="selectedVideo" :video-file="selectedVideo" />

        <!-- Audio Extraction Controls -->
        <div v-if="selectedVideo && ffmpegStatus.loaded" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium text-gray-800 mb-4">Extract Audio</h3>
          
          <div class="flex items-center space-x-4 mb-4">
            <label class="flex items-center">
              <input
                v-model="outputFormat"
                type="radio"
                value="wav"
                class="mr-2"
                :disabled="isProcessing"
              />
              <span class="text-sm">WAV (Uncompressed)</span>
            </label>
            
            <label class="flex items-center">
              <input
                v-model="outputFormat"
                type="radio"
                value="mp3"
                class="mr-2"
                :disabled="isProcessing"
              />
              <span class="text-sm">MP3 (Compressed)</span>
            </label>
          </div>

          <button
            @click="extractAudioHandler"
            :disabled="isProcessing || !selectedVideo"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isProcessing ? 'Extracting...' : 'Extract Audio' }}
          </button>

          <!-- Processing Progress -->
          <div v-if="isProcessing" class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Extracting audio...</span>
              <span class="text-sm font-medium text-gray-800">{{ processingProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${processingProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- Processing Error -->
          <div v-if="processingError" class="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="ml-2">
                <h4 class="text-sm font-medium text-red-800">Processing Error</h4>
                <p class="text-sm text-red-700 mt-1">{{ processingError }}</p>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="extractionSuccess" class="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="ml-2">
                <h4 class="text-sm font-medium text-green-800">Audio Extracted Successfully!</h4>
                <p class="text-sm text-green-700 mt-1">
                  Audio file has been downloaded. Check your downloads folder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Instructions -->
      <section class="bg-blue-50 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-blue-900 mb-4">How to Test</h2>
        <ol class="list-decimal list-inside space-y-2 text-blue-800">
          <li>Click "Initialize FFmpeg" to load the WebAssembly module</li>
          <li>Upload a video file using the drag-and-drop area or file picker</li>
          <li>Choose your preferred audio format (WAV or MP3)</li>
          <li>Click "Extract Audio" to start the conversion process</li>
          <li>Monitor the progress and check for any errors in the logs</li>
          <li>The extracted audio file will automatically download when complete</li>
        </ol>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VideoUpload from './VideoUpload.vue'
import VideoInfo from './VideoInfo.vue'
import { 
  initializeFFmpeg, 
  extractAudio, 
  downloadFile, 
  isFFmpegLoaded,
  type FFmpegStatus 
} from '../utils/ffmpeg'

// State
const selectedVideo = ref<File | null>(null)
const outputFormat = ref<'wav' | 'mp3'>('wav')
const isProcessing = ref(false)
const processingProgress = ref(0)
const processingError = ref('')
const extractionSuccess = ref(false)
const logs = ref<string[]>([])

const ffmpegStatus = ref<FFmpegStatus>({
  loaded: false,
  loading: false,
  error: null
})

// Computed
const statusIndicatorClass = computed(() => ({
  'bg-red-500': ffmpegStatus.value.error,
  'bg-yellow-500': ffmpegStatus.value.loading,
  'bg-green-500': ffmpegStatus.value.loaded,
  'bg-gray-400': !ffmpegStatus.value.loaded && !ffmpegStatus.value.loading && !ffmpegStatus.value.error
}))

const statusText = computed(() => {
  if (ffmpegStatus.value.error) return 'Error'
  if (ffmpegStatus.value.loading) return 'Loading...'
  if (ffmpegStatus.value.loaded) return 'Ready'
  return 'Not Initialized'
})

// Methods
const initializeFFmpegHandler = async () => {
  ffmpegStatus.value.loading = true
  ffmpegStatus.value.error = null
  logs.value = []

  try {
    await initializeFFmpeg(
      undefined, // No progress callback for initialization
      (message: string) => {
        logs.value.push(`[${new Date().toLocaleTimeString()}] ${message}`)
      }
    )
    
    ffmpegStatus.value.loaded = true
    ffmpegStatus.value.loading = false
  } catch (error) {
    ffmpegStatus.value.error = error instanceof Error ? error.message : 'Unknown error'
    ffmpegStatus.value.loading = false
  }
}

const handleVideoSelected = (file: File) => {
  selectedVideo.value = file
  extractionSuccess.value = false
  processingError.value = ''
}

const handleVideoCleared = () => {
  selectedVideo.value = null
  extractionSuccess.value = false
  processingError.value = ''
}

const handleUploadError = (error: string) => {
  processingError.value = error
}

const extractAudioHandler = async () => {
  if (!selectedVideo.value || !isFFmpegLoaded()) return

  isProcessing.value = true
  processingProgress.value = 0
  processingError.value = ''
  extractionSuccess.value = false

  try {
    const audioData = await extractAudio(
      selectedVideo.value,
      outputFormat.value,
      (progress: number) => {
        processingProgress.value = progress
      }
    )

    // Generate filename
    const baseName = selectedVideo.value.name.replace(/\.[^/.]+$/, '')
    const fileName = `${baseName}_extracted.${outputFormat.value}`
    const mimeType = outputFormat.value === 'wav' ? 'audio/wav' : 'audio/mpeg'

    // Download the extracted audio
    downloadFile(audioData, fileName, mimeType)
    
    extractionSuccess.value = true
  } catch (error) {
    processingError.value = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    isProcessing.value = false
    processingProgress.value = 0
  }
}

// Check if FFmpeg is already loaded on mount
if (isFFmpegLoaded()) {
  ffmpegStatus.value.loaded = true
}
</script>