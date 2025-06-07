<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">
          Step 1: Upload Your Video
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
        Upload your video file and extract audio for subtitle generation.
        Supported formats: MP4, WebM, AVI, MOV up to 500MB.
      </p>

      <!-- Help Section -->
      <div
        v-if="showHelp"
        class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <h3 class="text-lg font-semibold text-blue-900 mb-3">Step 1 Guide</h3>
        <div class="space-y-2 text-sm text-blue-800">
          <p><strong>What happens in this step:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Upload your source video file</li>
            <li>Extract audio track for speech recognition</li>
            <li>Choose audio format (WAV for quality, MP3 for smaller size)</li>
            <li>Preview extracted audio before proceeding</li>
          </ul>
          <p class="mt-3"><strong>Requirements:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Video file up to 500MB</li>
            <li>Supported formats: MP4, WebM, AVI, MOV</li>
            <li>Audio should be clear for best transcription results</li>
          </ul>
          <p class="mt-3">
            <strong>Alternative:</strong> You can also upload an existing audio
            file if you don't have a video.
          </p>
        </div>
      </div>

      <!-- Video Upload Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Select Video File</h2>
        <VideoUpload
          @file-selected="handleVideoSelected"
          @file-cleared="handleVideoCleared"
          :initial-file="workflowState.artifacts.videoFile"
        />
      </div>

      <!-- Video Info Display -->
      <div v-if="selectedVideo" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Video Information</h2>
        <VideoInfo :video-file="selectedVideo" />
      </div>

      <!-- Audio Extraction Section -->
      <div v-if="selectedVideo" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Extract Audio</h2>
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Audio Format Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Audio Format
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="audioFormat"
                  type="radio"
                  value="wav"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-2 text-sm"
                  >WAV (Uncompressed, Better Quality)</span
                >
              </label>
              <label class="flex items-center">
                <input
                  v-model="audioFormat"
                  type="radio"
                  value="mp3"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-2 text-sm">MP3 (Compressed, Smaller File)</span>
              </label>
            </div>
          </div>

          <!-- Extract Button -->
          <button
            @click="extractAudio"
            :disabled="isExtracting || !ffmpegReady"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isExtracting ? 'Extracting Audio...' : 'Extract Audio' }}
          </button>

          <!-- FFmpeg Status -->
          <div v-if="!ffmpegReady" class="mt-4">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span class="text-sm font-medium">Loading FFmpeg...</span>
            </div>
            <button
              @click="initializeFFmpeg"
              :disabled="ffmpegLoading"
              class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {{ ffmpegLoading ? 'Initializing...' : 'Initialize FFmpeg' }}
            </button>

            <div v-if="ffmpegLoading && ffmpegLoadProgress > 0" class="mt-2">
              <div class="flex justify-between text-sm">
                <span>Loading FFmpeg...</span>
                <span>{{ ffmpegLoadProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: ffmpegLoadProgress + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Extraction Progress -->
          <div v-if="isExtracting" class="mt-4">
            <div class="flex justify-between text-sm">
              <span>{{ extractionStatus }}</span>
              <span>{{ extractionProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: extractionProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Error Display -->
          <div
            v-if="extractionError"
            class="mt-4 bg-red-50 border border-red-200 rounded-md p-3"
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
                  Extraction Error
                </h3>
                <p class="mt-1 text-sm text-red-700">{{ extractionError }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Audio Preview -->
      <div v-if="extractedAudio" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Audio Preview</h2>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
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
                Audio extracted successfully ({{
                  formatFileSize(extractedAudio.byteLength)
                }})
              </span>
            </div>
            <button
              @click="downloadAudio"
              class="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Download Audio
            </button>
          </div>

          <audio
            ref="audioPlayer"
            :src="audioURL"
            controls
            class="w-full"
            preload="metadata"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      <!-- Alternative: Upload Existing Audio -->
      <div v-if="!extractedAudio" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">
          Or Upload Existing Audio File
        </h2>
        <p class="text-gray-600 mb-4">
          Skip audio extraction by uploading an existing audio file (MP3, WAV,
          M4A, OGG, FLAC).
        </p>
        <AudioUpload
          @file-selected="handleAudioSelected"
          @file-cleared="handleAudioCleared"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import VideoUpload from '@/components/VideoUpload.vue'
import VideoInfo from '@/components/VideoInfo.vue'
import AudioUpload from '@/components/AudioUpload.vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import {
  initializeFFmpeg as initFFmpeg,
  isFFmpegLoaded,
  extractAudio,
  downloadFile,
  type ProgressCallback,
} from '@/utils/ffmpeg'
import { formatFileSize } from '@/utils/translation'

const { workflowState, updateArtifacts, setProcessing, completeStep } =
  useWorkflowState()

// UI state
const showHelp = ref<boolean>(false)

// Reactive state
const selectedVideo = ref<File | null>(workflowState.artifacts.videoFile)
const extractedAudio = ref<Uint8Array | null>(
  workflowState.artifacts.extractedAudio
)
const audioFormat = ref<'wav' | 'mp3'>(workflowState.artifacts.audioFormat)
const audioURL = ref<string>('')

// FFmpeg state
const ffmpegReady = ref<boolean>(false)
const ffmpegLoading = ref<boolean>(false)
const ffmpegLoadProgress = ref<number>(0)

// Extraction state
const isExtracting = ref<boolean>(false)
const extractionProgress = ref<number>(0)
const extractionStatus = ref<string>('')
const extractionError = ref<string>('')

// Audio player reference
const audioPlayer = ref<HTMLAudioElement>()

// Check FFmpeg status on mount
onMounted(() => {
  ffmpegReady.value = isFFmpegLoaded()

  // Create audio URL if we have extracted audio
  if (extractedAudio.value) {
    createAudioURL()
  }
})

// Cleanup audio URL on unmount
onUnmounted(() => {
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
  }
})

// Watch for changes to update workflow state
watch([selectedVideo, extractedAudio, audioFormat], () => {
  updateArtifacts({
    videoFile: selectedVideo.value,
    extractedAudio: extractedAudio.value,
    audioFormat: audioFormat.value,
  })

  // Check if step is complete
  if (selectedVideo.value && extractedAudio.value) {
    completeStep(1)
  }
})

// Methods
function handleVideoSelected(file: File) {
  selectedVideo.value = file
  // Clear previous extraction
  extractedAudio.value = null
  extractionError.value = ''
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }
}

function handleVideoCleared() {
  selectedVideo.value = null
  extractedAudio.value = null
  extractionError.value = ''
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }
}

function handleAudioSelected(file: File) {
  // Convert uploaded audio file to Uint8Array and store
  const reader = new FileReader()
  reader.onload = e => {
    const arrayBuffer = e.target?.result as ArrayBuffer
    if (arrayBuffer) {
      extractedAudio.value = new Uint8Array(arrayBuffer)
      audioFormat.value = file.name.toLowerCase().endsWith('.mp3')
        ? 'mp3'
        : 'wav'
      createAudioURL()

      // Update workflow artifacts
      updateArtifacts({
        audioFile: file,
        extractedAudio: extractedAudio.value,
        audioFormat: audioFormat.value,
      })
    }
  }
  reader.readAsArrayBuffer(file)
}

function handleAudioCleared() {
  extractedAudio.value = null
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }
  updateArtifacts({
    audioFile: null,
    extractedAudio: null,
  })
}

async function initializeFFmpeg() {
  if (ffmpegLoading.value || ffmpegReady.value) return

  try {
    ffmpegLoading.value = true
    ffmpegLoadProgress.value = 0

    await initFFmpeg(
      (progress: number) => {
        ffmpegLoadProgress.value = progress
      },
      (message: string) => {
        console.log('FFmpeg:', message)
      }
    )

    ffmpegReady.value = true
    ffmpegLoadProgress.value = 100
  } catch (error) {
    console.error('FFmpeg initialization failed:', error)
    extractionError.value =
      error instanceof Error ? error.message : 'FFmpeg initialization failed'
  } finally {
    ffmpegLoading.value = false
  }
}

async function extractAudio() {
  if (!selectedVideo.value || !ffmpegReady.value) return

  try {
    isExtracting.value = true
    setProcessing(true)
    extractionError.value = ''
    extractionProgress.value = 0
    extractionStatus.value = 'Preparing for extraction...'

    const progressCallback: ProgressCallback = (progress: number) => {
      extractionProgress.value = progress
      extractionStatus.value = `Extracting audio... ${progress}%`
    }

    const audioData = await extractAudio(
      selectedVideo.value,
      audioFormat.value,
      progressCallback
    )

    extractedAudio.value = audioData
    extractionStatus.value = 'Extraction complete!'
    extractionProgress.value = 100

    // Create audio URL for preview
    createAudioURL()

    // Update workflow state
    updateArtifacts({
      extractedAudio: audioData,
      audioFormat: audioFormat.value,
    })
  } catch (error) {
    console.error('Audio extraction failed:', error)
    extractionError.value =
      error instanceof Error ? error.message : 'Audio extraction failed'
  } finally {
    isExtracting.value = false
    setProcessing(false)
  }
}

function createAudioURL() {
  if (extractedAudio.value) {
    // Clean up previous URL
    if (audioURL.value) {
      URL.revokeObjectURL(audioURL.value)
    }

    const mimeType = audioFormat.value === 'mp3' ? 'audio/mpeg' : 'audio/wav'
    const blob = new Blob([extractedAudio.value], { type: mimeType })
    audioURL.value = URL.createObjectURL(blob)
  }
}

function downloadAudio() {
  if (extractedAudio.value) {
    const filename = `extracted-audio.${audioFormat.value}`
    const mimeType = audioFormat.value === 'mp3' ? 'audio/mpeg' : 'audio/wav'
    downloadFile(extractedAudio.value, filename, mimeType)
  }
}
</script>
