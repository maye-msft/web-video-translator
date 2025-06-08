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
            <li>Choose demo video or upload your own source video file</li>
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
        </div>
      </div>

      <!-- Video Selection Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Choose Video Source</h2>

        <!-- Unified Video Source Selection Panel -->
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Option 1: Use Demo Video -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="videoSource"
                  type="radio"
                  value="demo"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Use Demo Video
                </span>
              </label>
              <div class="flex items-center text-sm text-blue-600">
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
                    d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m0 0V1a1 1 0 011 1v2m0 0h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h4z"
                  />
                </svg>
                Perfect for testing the app
              </div>
            </div>

            <div v-if="videoSource === 'demo'" class="ml-7">
              <div class="bg-white border rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
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
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <span class="text-sm font-medium text-gray-900"
                        >hello_world_video.mp4</span
                      >
                      <p class="text-xs text-gray-600">
                        Sample video with clear English speech - ideal for
                        testing transcription and translation
                      </p>
                    </div>
                  </div>
                  <button
                    @click="loadDemoVideo"
                    :disabled="isLoadingDemo"
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {{ isLoadingDemo ? 'Loading...' : 'Load Demo' }}
                  </button>
                </div>
                <div v-if="isDemoLoaded" class="mt-2 text-xs text-green-600">
                  ✓ Demo video loaded successfully
                </div>
              </div>
            </div>
          </div>

          <!-- Option 2: Upload Your Own Video -->
          <div>
            <div class="flex items-center mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="videoSource"
                  type="radio"
                  value="upload"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Upload Your Own Video
                </span>
              </label>
            </div>

            <div v-if="videoSource === 'upload'" class="ml-7">
              <p class="text-sm text-gray-600 mb-3">
                Upload your own video file for translation. Supports MP4, WebM,
                AVI, MOV up to 500MB.
              </p>
              <VideoUpload
                @file-selected="handleVideoSelected"
                @file-cleared="handleVideoCleared"
                :initial-file="uploadedVideoFile"
              />
            </div>
          </div>
        </div>
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

          <!-- Extract Audio Button (with automatic FFmpeg initialization) -->
          <button
            @click="extractAudioWithAutoInit"
            :disabled="isExtracting"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ getButtonText() }}
          </button>

          <!-- Extraction Progress -->
          <div v-if="isExtracting" class="mt-4">
            <div class="flex justify-between text-sm">
              <span>{{ extractionStatus || 'Extracting audio...' }}</span>
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

      <!-- Next Step Button -->
      <div v-if="extractedAudio" class="mb-8">
        <div class="flex justify-end">
          <button
            @click="proceedToStep2"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Next: Generate Subtitles</span>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import VideoUpload from '@/components/VideoUpload.vue'
import VideoInfo from '@/components/VideoInfo.vue'
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

const router = useRouter()

// UI state
const showHelp = ref<boolean>(false)
const videoSource = ref<string>('upload')
const uploadedVideoFile = ref<File | null>(null)
const isLoadingDemo = ref<boolean>(false)
const isDemoLoaded = ref<boolean>(false)

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

  // Initialize from workflow state (in case we navigated back to this step)
  if (workflowState.artifacts.videoFile) {
    selectedVideo.value = workflowState.artifacts.videoFile
  }
  if (workflowState.artifacts.extractedAudio) {
    extractedAudio.value = workflowState.artifacts.extractedAudio
  }
  if (workflowState.artifacts.audioFormat) {
    audioFormat.value = workflowState.artifacts.audioFormat
  }

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

// Watch for workflow state changes to sync back to local state
watch(
  () => workflowState.artifacts,
  newArtifacts => {
    if (newArtifacts.videoFile !== selectedVideo.value) {
      selectedVideo.value = newArtifacts.videoFile
    }
    if (newArtifacts.extractedAudio !== extractedAudio.value) {
      extractedAudio.value = newArtifacts.extractedAudio
      if (extractedAudio.value) {
        createAudioURL()
      }
    }
    if (newArtifacts.audioFormat !== audioFormat.value) {
      audioFormat.value = newArtifacts.audioFormat
    }
  },
  { deep: true }
)

// Watch for video source selection changes
watch(videoSource, newSource => {
  if (newSource === 'demo') {
    // Clear uploaded video when switching to demo
    uploadedVideoFile.value = null
  } else if (newSource === 'upload') {
    // Clear demo state when switching to upload
    isDemoLoaded.value = false
  }
})

// Methods
async function loadDemoVideo() {
  try {
    isLoadingDemo.value = true
    isDemoLoaded.value = false

    // Fetch the demo video from public assets
    const response = await fetch(
      '/web-video-translator/assets/hello_world_video.mp4'
    )
    if (!response.ok) {
      throw new Error('Failed to load demo video')
    }

    const arrayBuffer = await response.arrayBuffer()
    const file = new File([arrayBuffer], 'hello_world_video.mp4', {
      type: 'video/mp4',
    })

    // Clear previous video if any
    handleVideoCleared()

    // Set as selected video
    selectedVideo.value = file
    uploadedVideoFile.value = null // Clear uploaded file reference
    isDemoLoaded.value = true

    // Update workflow artifacts
    updateArtifacts({ videoFile: file })
  } catch (error) {
    console.error('Failed to load demo video:', error)
    alert(
      'Failed to load demo video. Please try uploading your own video instead.'
    )
  } finally {
    isLoadingDemo.value = false
  }
}

function handleVideoSelected(file: File) {
  // Only clear extracted audio if this is a different video file
  const isDifferentFile =
    !selectedVideo.value ||
    selectedVideo.value.name !== file.name ||
    selectedVideo.value.size !== file.size ||
    selectedVideo.value.lastModified !== file.lastModified

  selectedVideo.value = file
  uploadedVideoFile.value = file
  isDemoLoaded.value = false // Clear demo loaded state

  if (isDifferentFile) {
    // Clear previous extraction only for different files
    extractedAudio.value = null
    extractionError.value = ''
    if (audioURL.value) {
      URL.revokeObjectURL(audioURL.value)
      audioURL.value = ''
    }
  }

  // Update workflow artifacts
  updateArtifacts({ videoFile: file })
}

function handleVideoCleared() {
  selectedVideo.value = null
  uploadedVideoFile.value = null
  isDemoLoaded.value = false
  extractedAudio.value = null
  extractionError.value = ''
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }

  // Update workflow artifacts
  updateArtifacts({ videoFile: null })
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

async function extractAudioWithAutoInit() {
  if (!selectedVideo.value) return

  // Set initial state
  isExtracting.value = true
  extractionProgress.value = 0
  extractionStatus.value = 'Preparing for extraction...'
  extractionError.value = ''

  // Force DOM update
  await nextTick()

  // Add a small delay to ensure the UI renders
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    ffmpegLoading.value = false
    ffmpegLoadProgress.value = 0
    if (!ffmpegReady.value) {
      await initializeFFmpeg()
    }
    await extractAudioFromVideo()
  } catch (error) {
    console.error('Audio extraction with auto-init failed:', error)
    extractionError.value =
      error instanceof Error ? error.message : 'Audio extraction failed'
  } finally {
    isExtracting.value = false
  }
}

async function extractAudioFromVideo() {
  if (!selectedVideo.value || !ffmpegReady.value) return

  try {
    isExtracting.value = true
    setProcessing(true)
    extractionError.value = ''
    extractionProgress.value = 0
    extractionStatus.value = 'Preparing for extraction...'

    // Use a more responsive progress callback
    const progressCallback: ProgressCallback = (progress: number) => {
      // Clamp progress between 0 and 100
      const clamped = Math.max(0, Math.min(100, Math.round(progress)))
      extractionProgress.value = clamped
      extractionStatus.value =
        clamped < 100
          ? `Extracting audio... ${clamped}%`
          : 'Extraction complete!'
    }

    // Start progress simulation immediately and more aggressively
    let progressSimulation: NodeJS.Timeout | null = null
    let currentProgress = 5

    extractionProgress.value = 5 // Start with some initial progress

    // Force DOM update before starting simulation
    await nextTick()

    progressSimulation = setInterval(() => {
      if (currentProgress < 85) {
        // Increment by fixed amount for testing
        currentProgress += 10
        currentProgress = Math.min(currentProgress, 85)

        extractionProgress.value = currentProgress
        extractionStatus.value = `Extracting audio... ${currentProgress}%`
      }
    }, 800) // Update every 800ms for easier observation

    try {
      const audioData = await extractAudio(
        selectedVideo.value,
        audioFormat.value,
        progressCallback
      )

      // Clear the simulation timer
      if (progressSimulation) {
        clearInterval(progressSimulation)
        progressSimulation = null
      }

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
      // Clear the simulation timer on error
      if (progressSimulation) {
        clearInterval(progressSimulation)
        progressSimulation = null
      }
      throw error
    }
  } catch (error) {
    console.error('Audio extraction failed:', error)
    extractionError.value =
      error instanceof Error ? error.message : 'Audio extraction failed'
  } finally {
    isExtracting.value = false
    setProcessing(false)
  }
}

function getButtonText(): string {
  return isExtracting.value ? 'Extracting Audio...' : 'Extract Audio'
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

function proceedToStep2() {
  if (extractedAudio.value) {
    // Mark step 1 as completed
    completeStep(1)

    // Navigate to step 2
    router.push('/step-2')
  }
}
</script>
