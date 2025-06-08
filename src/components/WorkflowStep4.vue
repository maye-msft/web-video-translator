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

      <!-- Source Content Selection Panel -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Choose Video and Subtitles</h2>

        <!-- Combined Source Selection Panel -->
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Video Selection -->
          <div class="mb-6">
            <h3 class="font-medium text-gray-900 mb-3">Video Source</h3>

            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="videoSource"
                    type="radio"
                    value="workflow"
                    :disabled="!hasWorkflowVideo"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-3 text-sm font-medium text-gray-900">
                    Use Video from Step 1
                  </span>
                </label>
                <div
                  v-if="hasWorkflowVideo"
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
                  {{ workflowState.artifacts.videoFile?.name }}
                </div>
              </div>

              <div v-if="!hasWorkflowVideo" class="ml-7 text-sm text-gray-500">
                No video available from Step 1. Complete Step 1 first or upload
                video below.
              </div>
            </div>

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
                    Upload Video File
                  </span>
                </label>
              </div>

              <div v-if="videoSource === 'upload'" class="ml-7">
                <VideoUpload
                  @file-selected="handleVideoSelected"
                  @file-cleared="handleVideoCleared"
                  :initial-file="uploadedVideoFile"
                />
              </div>
            </div>
          </div>

          <!-- Subtitle Selection -->
          <div class="border-t pt-6">
            <h3 class="font-medium text-gray-900 mb-3">Subtitle Source</h3>

            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="subtitleSource"
                    type="radio"
                    value="workflow"
                    :disabled="!hasWorkflowSubtitles"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-3 text-sm font-medium text-gray-900">
                    Use Subtitles from Step 3
                  </span>
                </label>
                <div
                  v-if="hasWorkflowSubtitles"
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
                  {{ workflowState.artifacts.sourceLanguage }} →
                  {{ workflowState.artifacts.targetLanguage }}
                </div>
              </div>

              <div
                v-if="hasWorkflowSubtitles && subtitleSource === 'workflow'"
                class="ml-7"
              >
                <div class="bg-white border rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-700">Preview:</span>
                    <button
                      @click="
                        showWorkflowSubtitlePreview =
                          !showWorkflowSubtitlePreview
                      "
                      class="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {{ showWorkflowSubtitlePreview ? 'Hide' : 'Show' }} Full
                      Content
                    </button>
                  </div>
                  <div class="text-sm text-gray-600">
                    <pre
                      v-if="showWorkflowSubtitlePreview"
                      class="whitespace-pre-wrap font-mono max-h-32 overflow-y-auto"
                      >{{ workflowState.artifacts.translatedSRT }}</pre
                    >
                    <pre v-else class="whitespace-pre-wrap font-mono">{{
                      subtitlePreview
                    }}</pre>
                  </div>
                </div>
              </div>

              <div
                v-if="!hasWorkflowSubtitles"
                class="ml-7 text-sm text-gray-500"
              >
                No subtitles available from Step 3. Complete Step 3 first or
                upload subtitles below.
              </div>
            </div>

            <div>
              <div class="flex items-center mb-3">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="subtitleSource"
                    type="radio"
                    value="upload"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="ml-3 text-sm font-medium text-gray-900">
                    Upload Subtitle File
                  </span>
                </label>
              </div>

              <div v-if="subtitleSource === 'upload'" class="ml-7">
                <p class="text-sm text-gray-600 mb-3">
                  Upload an SRT subtitle file to merge with your video.
                </p>
                <SRTInput @content-changed="handleSRTUpload" />

                <div
                  v-if="uploadedSRTPreview"
                  class="mt-3 bg-white border rounded-lg p-3"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-700"
                      >Uploaded Content Preview:</span
                    >
                    <span class="text-xs text-green-600"
                      >{{ uploadedSegmentCount }} segments</span
                    >
                  </div>
                  <pre
                    class="text-sm text-gray-600 whitespace-pre-wrap font-mono max-h-24 overflow-y-auto"
                    >{{ uploadedSRTPreview }}</pre
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subtitle Styling (Collapsible) -->
      <div v-if="hasContentReady" class="mb-8">
        <div class="border rounded-lg">
          <button
            @click="showStyling = !showStyling"
            class="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 class="text-lg font-semibold text-gray-900">
              Subtitle Styling (Optional)
            </h2>
            <svg
              class="w-5 h-5 text-gray-500 transition-transform"
              :class="{ 'rotate-180': showStyling }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div v-if="showStyling" class="p-6 border-t">
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
                    >{{
                      Math.round(subtitleStyle.backgroundOpacity * 100)
                    }}%</span
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
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="hasContentReady" class="mb-8">
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
      <div v-if="hasContentReady" class="mb-8">
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
      <div v-if="hasContentReady" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Generate Final Video</h2>
        <div class="space-y-4">
          <button
            @click="handleMergeVideo"
            :disabled="isProcessing"
            class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {{
              isProcessing
                ? 'Processing...'
                : !isFFmpegReady
                  ? ffmpegLoading
                    ? 'Loading FFmpeg...'
                    : 'Merge Video'
                  : 'Merge Subtitles into Video'
            }}
          </button>

          <!-- Processing Progress -->
          <div v-if="isProcessing" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>{{ processingStatus }}</span>
              <span>{{ processingProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                :style="{ width: Math.min(processingProgress, 100) + '%' }"
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

      <!-- Simple Completion -->
      <div v-if="isWorkflowComplete" class="mb-8">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
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
                Video processing complete! Your translated video is ready.
              </span>
            </div>
            <button
              @click="downloadFinalVideo"
              class="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Download Video
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
const showStyling = ref<boolean>(false)
const videoSource = ref<string>(
  workflowState.artifacts.videoFile ? 'workflow' : 'upload'
)
const subtitleSource = ref<string>(
  workflowState.artifacts.translatedSRT ? 'workflow' : 'upload'
)
const showWorkflowSubtitlePreview = ref<boolean>(false)
const uploadedVideoFile = ref<File | null>(null)
const uploadedSRTPreview = ref<string>('')
const uploadedSegmentCount = ref<number>(0)

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
const hasWorkflowVideo = computed(
  () => workflowState.artifacts.videoFile !== null
)
const hasWorkflowSubtitles = computed(
  () => workflowState.artifacts.translatedSRT !== ''
)
const hasVideoFile = computed(() => {
  return videoSource.value === 'workflow'
    ? hasWorkflowVideo.value
    : uploadedVideoFile.value !== null
})
const hasTranslatedSubtitles = computed(() => {
  return subtitleSource.value === 'workflow'
    ? hasWorkflowSubtitles.value
    : uploadedSRTPreview.value !== ''
})
const hasContentReady = computed(
  () => hasVideoFile.value && hasTranslatedSubtitles.value
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

// Initialize source selections based on workflow state
watch(
  [hasWorkflowVideo, hasWorkflowSubtitles],
  () => {
    if (hasWorkflowVideo.value && videoSource.value === 'upload') {
      videoSource.value = 'workflow'
    }
    if (hasWorkflowSubtitles.value && subtitleSource.value === 'upload') {
      subtitleSource.value = 'workflow'
    }
  },
  { immediate: true }
)

// Watch for source selection changes
watch(videoSource, newSource => {
  if (newSource === 'workflow' && hasWorkflowVideo.value) {
    updateArtifacts({ videoFile: workflowState.artifacts.videoFile })
  } else if (newSource === 'upload' && uploadedVideoFile.value) {
    updateArtifacts({ videoFile: uploadedVideoFile.value })
  }
})

watch(subtitleSource, newSource => {
  if (newSource === 'workflow' && hasWorkflowSubtitles.value) {
    updateArtifacts({
      translatedSRT: workflowState.artifacts.translatedSRT,
      translationSegments: workflowState.artifacts.translationSegments
        ? workflowState.artifacts.translationSegments.map(s => ({
            ...s,
            timestamp: [s.timestamp[0], s.timestamp[1]] as [number, number],
          }))
        : [],
    })
  } else if (newSource === 'upload' && uploadedSRTPreview.value) {
    // Keep uploaded content - already handled in handleSRTUpload
  }
})

// Methods
function handleVideoSelected(file: File) {
  uploadedVideoFile.value = file
  if (videoSource.value === 'upload') {
    updateArtifacts({ videoFile: file })
  }
}

function handleVideoCleared() {
  uploadedVideoFile.value = null
  if (videoSource.value === 'upload') {
    updateArtifacts({ videoFile: null })
  }
}

function handleSRTUpload(segments: SubtitleSegment[], rawContent: string) {
  uploadedSRTPreview.value =
    rawContent.slice(0, 200) + (rawContent.length > 200 ? '...' : '')
  uploadedSegmentCount.value = segments.length

  if (subtitleSource.value === 'upload') {
    updateArtifacts({
      translatedSRT: rawContent,
      translationSegments: segments,
    })
  }
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

async function handleMergeVideo() {
  if (!isFFmpegReady.value) {
    await initializeFFmpeg()
    if (!isFFmpegReady.value) return
  }
  await processVideo()
}

function downloadFinalVideo() {
  if (workflowState.artifacts.finalVideo) {
    const filename = `${outputFilename.value}.${outputFormat.value}`
    const mimeType = outputFormat.value === 'mp4' ? 'video/mp4' : 'video/webm'
    downloadFile(workflowState.artifacts.finalVideo, filename, mimeType)
  }
}
</script>
