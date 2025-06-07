<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        FFmpeg Subtitle Merge Test
      </h1>
      <p class="text-gray-600 mb-6">
        Test subtitle burning functionality with FFmpeg WASM
      </p>

      <!-- Video Upload -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">1. Upload Video</h2>
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
        >
          <input
            ref="videoFileInput"
            type="file"
            accept="video/*"
            @change="handleVideoUpload"
            class="hidden"
          />
          <div v-if="!videoFile">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="mt-4">
              <button
                @click="$refs.videoFileInput.click()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Choose Video File
              </button>
              <p class="mt-2 text-sm text-gray-500">
                MP4, WebM, AVI, MOV up to 100MB
              </p>
            </div>
          </div>
          <div v-else class="text-left">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ videoFile.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(videoFile.size) }}
                </p>
              </div>
              <button
                @click="clearVideo"
                class="text-red-600 hover:text-red-700"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Subtitle Input -->
      <div class="mb-6" v-if="videoFile">
        <h2 class="text-xl font-semibold mb-3">2. Input Subtitles</h2>
        <SRTInput @content-changed="handleSRTContent" />
      </div>

      <!-- Subtitle Styling -->
      <div class="mb-6" v-if="srtContent">
        <h2 class="text-xl font-semibold mb-3">3. Subtitle Styling</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Font Settings -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-700">Font</h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Font Family</label
              >
              <select
                v-model="subtitleStyle.fontFamily"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Font Size</label
              >
              <input
                v-model.number="subtitleStyle.fontSize"
                type="range"
                min="12"
                max="72"
                class="w-full"
              />
              <span class="text-sm text-gray-500"
                >{{ subtitleStyle.fontSize }}px</span
              >
            </div>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="subtitleStyle.bold"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm">Bold</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="subtitleStyle.italic"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm">Italic</span>
              </label>
            </div>
          </div>

          <!-- Colors -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-700">Colors</h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Text Color</label
              >
              <input
                v-model="subtitleStyle.fontColor"
                type="color"
                class="h-10 w-full rounded border border-gray-300"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Background Color</label
              >
              <input
                v-model="subtitleStyle.backgroundColor"
                type="color"
                class="h-10 w-full rounded border border-gray-300"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Background Opacity</label
              >
              <input
                v-model.number="subtitleStyle.backgroundOpacity"
                type="range"
                min="0"
                max="1"
                step="0.1"
                class="w-full"
              />
              <span class="text-sm text-gray-500"
                >{{ Math.round(subtitleStyle.backgroundOpacity * 100) }}%</span
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Outline Color</label
              >
              <input
                v-model="subtitleStyle.outlineColor"
                type="color"
                class="h-10 w-full rounded border border-gray-300"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Outline Width</label
              >
              <input
                v-model.number="subtitleStyle.outlineWidth"
                type="range"
                min="0"
                max="5"
                class="w-full"
              />
              <span class="text-sm text-gray-500"
                >{{ subtitleStyle.outlineWidth }}px</span
              >
            </div>
          </div>

          <!-- Position -->
          <div class="space-y-3">
            <h3 class="font-medium text-gray-700">Position</h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Horizontal Alignment</label
              >
              <select
                v-model="subtitleStyle.alignment"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Vertical Position</label
              >
              <select
                v-model="subtitleStyle.verticalPosition"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Horizontal Margin</label
              >
              <input
                v-model.number="subtitleStyle.marginHorizontal"
                type="range"
                min="0"
                max="100"
                class="w-full"
              />
              <span class="text-sm text-gray-500"
                >{{ subtitleStyle.marginHorizontal }}px</span
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Vertical Margin</label
              >
              <input
                v-model.number="subtitleStyle.marginVertical"
                type="range"
                min="0"
                max="100"
                class="w-full"
              />
              <span class="text-sm text-gray-500"
                >{{ subtitleStyle.marginVertical }}px</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="mb-6" v-if="srtContent">
        <h2 class="text-xl font-semibold mb-3">4. Preview</h2>
        <div class="space-y-3">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700"
              >Preview Time:</label
            >
            <input
              v-model.number="previewTime"
              type="number"
              min="0"
              step="0.1"
              class="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seconds"
            />
            <button
              @click="generatePreview"
              :disabled="isProcessing"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Generate Preview
            </button>
          </div>
          <div v-if="previewImage" class="border rounded-lg p-4">
            <img
              :src="previewImage"
              alt="Subtitle Preview GIF"
              class="max-w-full h-auto rounded"
            />
            <p class="text-sm text-gray-600 mt-2 text-center">3-second preview GIF with subtitles</p>
          </div>
        </div>
      </div>

      <!-- Output Settings -->
      <div class="mb-6" v-if="srtContent">
        <h2 class="text-xl font-semibold mb-3">5. Output Settings</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Output Format</label
            >
            <select
              v-model="outputFormat"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mp4">MP4 (H.264)</option>
              <option value="webm">WebM (VP9)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Output Filename</label
            >
            <input
              v-model="outputFilename"
              type="text"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="video-with-subtitles"
            />
          </div>
        </div>
      </div>

      <!-- Processing -->
      <div class="mb-6" v-if="srtContent">
        <h2 class="text-xl font-semibold mb-3">6. Process Video</h2>
        <div class="space-y-4">
          <button
            @click="processVideo"
            :disabled="isProcessing || !isFFmpegReady"
            class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isProcessing ? 'Processing...' : 'Merge Subtitles' }}
          </button>

          <!-- Progress Bar -->
          <div v-if="isProcessing" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>{{ processingStatus }}</span>
              <span>{{ processingProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                :style="{ width: processingProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Error Display -->
          <div
            v-if="processingError"
            class="bg-red-50 border border-red-200 rounded-md p-4"
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
                  Processing Error
                </h3>
                <p class="mt-1 text-sm text-red-700">{{ processingError }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FFmpeg Status -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-3">FFmpeg Status</h2>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <div
              :class="[
                'w-3 h-3 rounded-full',
                isFFmpegReady
                  ? 'bg-green-500'
                  : ffmpegLoading
                    ? 'bg-yellow-500'
                    : 'bg-red-500',
              ]"
            ></div>
            <span class="font-medium">
              {{
                isFFmpegReady
                  ? 'Ready'
                  : ffmpegLoading
                    ? 'Loading...'
                    : 'Not Loaded'
              }}
            </span>
          </div>
          <div v-if="!isFFmpegReady" class="space-y-2">
            <button
              @click="initializeFFmpeg"
              :disabled="ffmpegLoading"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ ffmpegLoading ? 'Loading FFmpeg...' : 'Initialize FFmpeg' }}
            </button>
            <div
              v-if="ffmpegLoading && ffmpegLoadProgress > 0"
              class="space-y-1"
            >
              <div class="flex justify-between text-sm">
                <span>Loading FFmpeg...</span>
                <span>{{ ffmpegLoadProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: ffmpegLoadProgress + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <div v-if="ffmpegError" class="text-red-600 text-sm mt-2">
            Error: {{ ffmpegError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import SRTInput from '@/components/SRTInput.vue'
import {
  initializeFFmpeg as initFFmpeg,
  isFFmpegLoaded,
  mergeSubtitles,
  processVideoWithSubtitles,
  generateSubtitlePreview,
  downloadFile,
  DEFAULT_SUBTITLE_STYLE,
  type SubtitleStyle,
  type VideoProcessingResult,
} from '@/utils/ffmpeg'
import { formatFileSize } from '@/utils/translation'

// Reactive state
const videoFile = ref<File | null>(null)
const srtContent = ref<string>('')
const outputFormat = ref<'mp4' | 'webm'>('mp4')
const outputFilename = ref<string>('video-with-subtitles')
const previewTime = ref<number>(5)
const previewImage = ref<string>('')

// FFmpeg state
const isFFmpegReady = ref<boolean>(false)
const ffmpegLoading = ref<boolean>(false)
const ffmpegLoadProgress = ref<number>(0)
const ffmpegError = ref<string>('')

// Processing state
const isProcessing = ref<boolean>(false)
const processingProgress = ref<number>(0)
const processingStatus = ref<string>('')
const processingError = ref<string>('')

// Subtitle styling
const subtitleStyle = reactive<SubtitleStyle>({ ...DEFAULT_SUBTITLE_STYLE })

// File upload handler
const handleVideoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    videoFile.value = file
    // Reset previous states
    srtContent.value = ''
    previewImage.value = ''
    processingError.value = ''
  }
}

// Clear video
const clearVideo = () => {
  videoFile.value = null
  srtContent.value = ''
  previewImage.value = ''
  processingError.value = ''
}

// Handle SRT content from input component
const handleSRTContent = (segments: any, rawContent: string) => {
  srtContent.value = rawContent
  previewImage.value = ''
}

// Initialize FFmpeg
const initializeFFmpeg = async () => {
  if (ffmpegLoading.value || isFFmpegReady.value) return

  try {
    ffmpegLoading.value = true
    ffmpegError.value = ''
    ffmpegLoadProgress.value = 0

    await initFFmpeg(
      progress => {
        ffmpegLoadProgress.value = progress
      },
      message => {
        console.log('FFmpeg:', message)
      }
    )

    isFFmpegReady.value = true
    ffmpegLoadProgress.value = 100
  } catch (error) {
    ffmpegError.value = error instanceof Error ? error.message : 'Unknown error'
    console.error('FFmpeg initialization failed:', error)
  } finally {
    ffmpegLoading.value = false
  }
}

// Generate preview
const generatePreview = async () => {
  if (!videoFile.value || !srtContent.value) return

  try {
    // Clear previous errors
    processingError.value = ''
    processingStatus.value = 'Generating preview...'

    // Check file size before processing
    const maxSize = 200 * 1024 * 1024 // 200MB
    if (videoFile.value.size > maxSize) {
      throw new Error(
        `Video file is too large (${Math.round(videoFile.value.size / 1024 / 1024)}MB). Please use a file smaller than 200MB for preview.`
      )
    }

    const previewData = await generateSubtitlePreview(
      videoFile.value,
      srtContent.value,
      previewTime.value,
      subtitleStyle
    )

    const blob = new Blob([previewData], { type: 'image/gif' })
    previewImage.value = URL.createObjectURL(blob)
    processingStatus.value = 'Preview generated successfully'
  } catch (error) {
    console.error('Preview generation failed:', error)
    processingError.value =
      error instanceof Error ? error.message : 'Preview generation failed'
  } finally {
    // Clear processing status after a delay
    setTimeout(() => {
      if (processingStatus.value === 'Preview generated successfully') {
        processingStatus.value = ''
      }
    }, 2000)
  }
}

// Process video with subtitles
const processVideo = async () => {
  if (!videoFile.value || !srtContent.value) return

  try {
    isProcessing.value = true
    processingError.value = ''
    processingProgress.value = 0
    processingStatus.value = 'Processing video...'

    const result: VideoProcessingResult = await processVideoWithSubtitles(
      videoFile.value,
      srtContent.value,
      subtitleStyle,
      outputFormat.value,
      progress => {
        processingProgress.value = progress
        processingStatus.value = `Processing video... ${progress}%`
      }
    )

    // Download the result
    const filename = `${outputFilename.value}.${result.format}`
    const mimeType = result.format === 'mp4' ? 'video/mp4' : 'video/webm'

    downloadFile(result.outputData, filename, mimeType)

    processingStatus.value = 'Complete!'
    processingProgress.value = 100

    // Reset after a delay
    setTimeout(() => {
      isProcessing.value = false
      processingProgress.value = 0
      processingStatus.value = ''
    }, 2000)
  } catch (error) {
    processingError.value =
      error instanceof Error ? error.message : 'Processing failed'
    console.error('Video processing failed:', error)
    isProcessing.value = false
  }
}

// Check FFmpeg status on mount
onMounted(() => {
  isFFmpegReady.value = isFFmpegLoaded()
})
</script>

<style scoped>
/* Custom styles for this component */
.transition-all {
  transition: all 0.3s ease;
}
</style>
