<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">
          Step 4: Style and Merge Subtitles
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
        Customize your subtitle appearance and merge them into your video.
        Generate a final video with burned-in subtitles.
      </p>

      <!-- Help Section -->
      <div
        v-if="showHelp"
        class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <h3 class="text-lg font-semibold text-blue-900 mb-3">Step 4 Guide</h3>
        <div class="space-y-2 text-sm text-blue-800">
          <p><strong>What happens in this step:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Customize subtitle appearance (font, size, color, position)</li>
            <li>Preview subtitles overlaid on video frames</li>
            <li>Generate final video with burned-in subtitles</li>
            <li>Download your completed translated video</li>
          </ul>
          <p class="mt-3"><strong>Styling Options:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Font Family:</strong> Arial, Times New Roman, or monospace
            </li>
            <li>
              <strong>Size & Color:</strong> Customizable text and background
            </li>
            <li><strong>Position:</strong> Bottom, top, or center alignment</li>
            <li>
              <strong>Background:</strong> Transparent, semi-transparent, or
              solid
            </li>
          </ul>
          <p class="mt-3">
            <strong>Output:</strong> Final video preserves original quality with
            embedded subtitles that cannot be turned off.
          </p>
        </div>
      </div>

      <!-- Source Content Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Source Content</h2>

        <!-- Video from Step 1 -->
        <div
          v-if="hasVideoFile"
          class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
        >
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
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-8 0v18m0-18h8m-8 0h8v18H7V4z"
              />
            </svg>
            <span class="text-sm font-medium text-green-800">
              Video: {{ workflowState.artifacts.videoFile?.name }}
            </span>
          </div>
        </div>

        <!-- Translated Subtitles from Step 3 -->
        <div
          v-if="hasTranslatedSubtitles"
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
                Translated Subtitles:
                {{ workflowState.artifacts.sourceLanguage }} →
                {{ workflowState.artifacts.targetLanguage }}
              </span>
            </div>
            <button
              @click="showSubtitlePreview = !showSubtitlePreview"
              class="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {{ showSubtitlePreview ? 'Hide' : 'Show' }} Preview
            </button>
          </div>

          <!-- Subtitle Preview -->
          <div
            v-if="showSubtitlePreview"
            class="mt-4 p-3 bg-white rounded border"
          >
            <div class="text-sm text-gray-600 max-h-32 overflow-y-auto">
              <pre class="whitespace-pre-wrap font-mono">{{
                subtitlePreview
              }}</pre>
            </div>
          </div>
        </div>

        <!-- Upload alternative content if missing -->
        <div v-if="!hasVideoFile || !hasTranslatedSubtitles" class="space-y-4">
          <!-- Upload Video -->
          <div v-if="!hasVideoFile">
            <h3 class="font-medium text-gray-900 mb-2">Upload Video File</h3>
            <VideoUpload
              @file-selected="handleVideoSelected"
              @file-cleared="handleVideoCleared"
            />
          </div>

          <!-- Upload Subtitles -->
          <div v-if="!hasTranslatedSubtitles">
            <h3 class="font-medium text-gray-900 mb-2">Upload Subtitle File</h3>
            <SRTInput @content-changed="handleSRTUpload" />
          </div>
        </div>
      </div>

      <!-- Subtitle Styling -->
      <div v-if="hasVideoFile && hasTranslatedSubtitles" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Subtitle Styling</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Font Settings -->
          <div class="space-y-4">
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
          <div class="space-y-4">
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
          <div class="space-y-4">
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

      <!-- Preview Section -->
      <div v-if="hasVideoFile && hasTranslatedSubtitles" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Preview</h2>
        <div class="space-y-4">
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
              Generate Preview GIF
            </button>
          </div>

          <div v-if="previewImage" class="border rounded-lg p-4">
            <img
              :src="previewImage"
              alt="Subtitle Preview GIF"
              class="max-w-full h-auto rounded"
            />
            <p class="text-sm text-gray-600 mt-2 text-center">
              3-second preview GIF with subtitles
            </p>
          </div>
        </div>
      </div>

      <!-- Output Settings -->
      <div v-if="hasVideoFile && hasTranslatedSubtitles" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Output Settings</h2>
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

      <!-- Final Processing -->
      <div v-if="hasVideoFile && hasTranslatedSubtitles" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Generate Final Video</h2>
        <div class="space-y-4">
          <button
            @click="processVideo"
            :disabled="isProcessing || !isFFmpegReady"
            class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isProcessing ? 'Processing...' : 'Merge Subtitles into Video' }}
          </button>

          <!-- FFmpeg Status -->
          <div
            v-if="!isFFmpegReady"
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span class="font-medium">FFmpeg not ready</span>
            </div>
            <button
              @click="initializeFFmpeg"
              :disabled="ffmpegLoading"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ ffmpegLoading ? 'Loading FFmpeg...' : 'Initialize FFmpeg' }}
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

          <!-- Processing Progress -->
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

      <!-- Workflow Completion Celebration -->
      <div v-if="isWorkflowComplete" class="mb-8">
        <div
          class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-8 text-center"
        >
          <div class="flex justify-center mb-4">
            <div class="relative">
              <svg
                class="h-16 w-16 text-green-600 animate-bounce"
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
              <div class="absolute -top-1 -right-1">
                <svg
                  class="h-6 w-6 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h3 class="text-2xl font-bold text-green-800 mb-3">
            🎉 Video Translation Complete! 🎉
          </h3>
          <p class="text-lg text-green-700 mb-4">
            Congratulations! Your video has been successfully translated and is
            ready to share.
          </p>

          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700 mb-6"
          >
            <div class="flex items-center justify-center">
              <svg
                class="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0V6a1 1 0 001 1h8a1 1 0 001-1V4"
                />
              </svg>
              Audio Extracted
            </div>
            <div class="flex items-center justify-center">
              <svg
                class="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Subtitles Generated
            </div>
            <div class="flex items-center justify-center">
              <svg
                class="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
              </svg>
              Translation Applied
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              @click="downloadFinalVideo"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Video Again
            </button>
            <button
              @click="shareResults"
              class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share Results
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import VideoUpload from '@/components/VideoUpload.vue'
import SRTInput from '@/components/SRTInput.vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import {
  initializeFFmpeg as initFFmpeg,
  isFFmpegLoaded,
  processVideoWithSubtitles,
  generateSubtitlePreview,
  downloadFile,
  DEFAULT_SUBTITLE_STYLE,
  type SubtitleStyle,
  type VideoProcessingResult,
  type ProgressCallback,
} from '@/utils/ffmpeg'
import type { SubtitleSegment } from '@/utils/translation'

const { workflowState, updateArtifacts, setProcessing, completeStep } =
  useWorkflowState()

// UI state
const showHelp = ref<boolean>(false)

// Reactive state
const subtitleStyle = reactive<SubtitleStyle>({
  ...DEFAULT_SUBTITLE_STYLE,
  ...workflowState.artifacts.subtitleStyle,
})
const outputFormat = ref<'mp4' | 'webm'>(
  workflowState.artifacts.outputFormat || 'mp4'
)
const outputFilename = ref<string>('video-with-subtitles')
const previewTime = ref<number>(5)
const previewImage = ref<string>('')
const showSubtitlePreview = ref<boolean>(false)

// FFmpeg state
const isFFmpegReady = ref<boolean>(false)
const ffmpegLoading = ref<boolean>(false)
const ffmpegLoadProgress = ref<number>(0)

// Processing state
const isProcessing = ref<boolean>(false)
const processingProgress = ref<number>(0)
const processingStatus = ref<string>('')
const processingError = ref<string>('')

// Computed properties
const hasVideoFile = computed(() => workflowState.artifacts.videoFile !== null)
const hasTranslatedSubtitles = computed(
  () => workflowState.artifacts.translatedSRT !== ''
)

const subtitlePreview = computed(() => {
  const content = workflowState.artifacts.translatedSRT || ''
  return content.slice(0, 300) + (content.length > 300 ? '...' : '')
})

const isWorkflowComplete = computed(() => {
  return (
    workflowState.completedSteps.includes(4) &&
    workflowState.artifacts.finalVideo !== null
  )
})

// Check FFmpeg status on mount
onMounted(() => {
  isFFmpegReady.value = isFFmpegLoaded()
})

// Watch for changes to update workflow state
watch(
  [subtitleStyle, outputFormat],
  () => {
    updateArtifacts({
      subtitleStyle: { ...subtitleStyle },
      outputFormat: outputFormat.value,
    })
  },
  { deep: true }
)

// Methods
function handleVideoSelected(file: File) {
  updateArtifacts({ videoFile: file })
}

function handleVideoCleared() {
  updateArtifacts({ videoFile: null })
}

function handleSRTUpload(segments: SubtitleSegment[], rawContent: string) {
  updateArtifacts({
    translatedSRT: rawContent,
    translationSegments: segments,
  })
}

async function initializeFFmpeg() {
  if (ffmpegLoading.value || isFFmpegReady.value) return

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

    isFFmpegReady.value = true
    ffmpegLoadProgress.value = 100
  } catch (error) {
    console.error('FFmpeg initialization failed:', error)
    processingError.value =
      error instanceof Error ? error.message : 'FFmpeg initialization failed'
  } finally {
    ffmpegLoading.value = false
  }
}

async function generatePreview() {
  if (
    !workflowState.artifacts.videoFile ||
    !workflowState.artifacts.translatedSRT
  )
    return

  try {
    processingError.value = ''
    processingStatus.value = 'Generating preview...'

    // Check file size before processing
    const maxSize = 200 * 1024 * 1024 // 200MB
    if (workflowState.artifacts.videoFile.size > maxSize) {
      throw new Error(
        `Video file is too large (${Math.round(workflowState.artifacts.videoFile.size / 1024 / 1024)}MB). Please use a file smaller than 200MB for preview.`
      )
    }

    const previewData = await generateSubtitlePreview(
      workflowState.artifacts.videoFile,
      workflowState.artifacts.translatedSRT,
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

async function processVideo() {
  if (
    !workflowState.artifacts.videoFile ||
    !workflowState.artifacts.translatedSRT
  )
    return

  try {
    isProcessing.value = true
    setProcessing(true)
    processingError.value = ''
    processingProgress.value = 0
    processingStatus.value = 'Processing video...'

    const progressCallback: ProgressCallback = (progress: number) => {
      processingProgress.value = progress
      processingStatus.value = `Processing video... ${progress}%`
    }

    const result: VideoProcessingResult = await processVideoWithSubtitles(
      workflowState.artifacts.videoFile,
      workflowState.artifacts.translatedSRT,
      subtitleStyle,
      outputFormat.value,
      progressCallback
    )

    // Download the result
    const filename = `${outputFilename.value}.${result.format}`
    const mimeType = result.format === 'mp4' ? 'video/mp4' : 'video/webm'

    downloadFile(result.outputData, filename, mimeType)

    // Update workflow state
    updateArtifacts({
      finalVideo: result.outputData,
    })

    processingStatus.value = 'Complete!'
    processingProgress.value = 100

    // Mark step as complete
    completeStep(4)

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
  } finally {
    setProcessing(false)
  }
}

function downloadFinalVideo() {
  if (finalVideoResult.value?.videoData) {
    const filename = `translated-video-${workflowState.artifacts.targetLanguage}.${outputFormat.value}`
    downloadFile(finalVideoResult.value.videoData, filename)
  }
}

function shareResults() {
  // Simple share functionality - could be enhanced with Web Share API
  const text = `I just translated a video using Web Video Translator! 🎉\n\nTranslated from ${workflowState.artifacts.sourceLanguage} to ${workflowState.artifacts.targetLanguage} with AI-powered subtitles.`

  if (navigator.share) {
    navigator
      .share({
        title: 'Video Translation Complete!',
        text: text,
        url: window.location.href,
      })
      .catch(console.error)
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Results copied to clipboard! Share it with your friends.')
      })
      .catch(() => {
        alert(
          'Video translation completed successfully! Share your achievement.'
        )
      })
  }
}
</script>
