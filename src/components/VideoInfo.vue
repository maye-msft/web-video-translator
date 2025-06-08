<template>
  <div v-if="videoData" class="bg-white rounded-lg shadow-md p-6 mt-6">
    <h3 class="text-xl font-semibold text-gray-800 mb-4">Video Information</h3>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Video Preview -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-2">Preview</h4>
        <div class="relative bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref="videoElement"
            :src="videoUrl"
            class="w-full h-48 object-cover"
            controls
            preload="metadata"
            @loadedmetadata="extractMetadata"
            @error="handleVideoError"
          />
          <canvas
            ref="thumbnailCanvas"
            class="hidden"
            width="320"
            height="240"
          />
        </div>

        <!-- Thumbnail -->
        <!-- <div v-if="thumbnail" class="mt-2">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Thumbnail</h4>
          <img
            :src="thumbnail"
            alt="Video thumbnail"
            class="w-32 h-24 object-cover rounded border"
          />
        </div> -->
      </div>

      <!-- Video Metadata -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-3">Details</h4>
        <div class="space-y-3">
          <!-- File Name -->
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">File Name:</span>
            <span
              class="text-sm font-medium text-gray-900 truncate ml-2"
              :title="videoData.name"
            >
              {{ videoData.name }}
            </span>
          </div>

          <!-- File Size -->
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">File Size:</span>
            <span class="text-sm font-medium text-gray-900">{{
              formatFileSize(videoData.size)
            }}</span>
          </div>

          <!-- File Type -->
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Format:</span>
            <span class="text-sm font-medium text-gray-900">{{
              videoData.type || 'Unknown'
            }}</span>
          </div>

          <!-- Duration -->
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Duration:</span>
            <span class="text-sm font-medium text-gray-900">
              {{
                metadata.duration
                  ? formatDuration(metadata.duration)
                  : 'Loading...'
              }}
            </span>
          </div>

          <!-- Dimensions -->
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Dimensions:</span>
            <span class="text-sm font-medium text-gray-900">
              {{
                metadata.width && metadata.height
                  ? `${metadata.width} × ${metadata.height}`
                  : 'Loading...'
              }}
            </span>
          </div>

          <!-- Last Modified -->
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Modified:</span>
            <span class="text-sm font-medium text-gray-900">
              {{ formatDate(videoData.lastModified) }}
            </span>
          </div>
        </div>

        <!-- Processing Status -->
        <div
          v-if="isLoading"
          class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
        >
          <div class="flex items-center">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
            ></div>
            <p class="ml-2 text-sm text-blue-700">Loading video metadata...</p>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-if="error"
          class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
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
            <p class="ml-2 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// Props
const props = defineProps<{
  videoFile: File | null
}>()

// Reactive state
const videoElement = ref<HTMLVideoElement>()
const thumbnailCanvas = ref<HTMLCanvasElement>()
const videoUrl = ref('')
const thumbnail = ref('')
const isLoading = ref(false)
const error = ref('')

const metadata = ref({
  duration: 0,
  width: 0,
  height: 0,
})

// Computed
const videoData = computed(() => props.videoFile)

// Methods
const clearVideo = () => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = ''
  }
  thumbnail.value = ''
  metadata.value = { duration: 0, width: 0, height: 0 }
  error.value = ''
  isLoading.value = false
}

const loadVideo = (file: File) => {
  clearVideo()
  isLoading.value = true
  error.value = ''

  try {
    // Create object URL for video
    videoUrl.value = URL.createObjectURL(file)
  } catch (err) {
    error.value = 'Failed to load video file'
    isLoading.value = false
  }
}

const extractMetadata = () => {
  const video = videoElement.value
  if (!video) return

  try {
    metadata.value = {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    }

    // Generate thumbnail
    generateThumbnail()
    isLoading.value = false
  } catch (err) {
    error.value = 'Failed to extract video metadata'
    isLoading.value = false
  }
}

const generateThumbnail = () => {
  const video = videoElement.value
  const canvas = thumbnailCanvas.value
  if (!video || !canvas) return

  try {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 320
    canvas.height = 240

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to data URL
    thumbnail.value = canvas.toDataURL('image/jpeg', 0.8)
  } catch (err) {
    console.warn('Failed to generate thumbnail:', err)
  }
}

const handleVideoError = () => {
  error.value =
    'Failed to load video. The file may be corrupted or in an unsupported format.'
  isLoading.value = false
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Watch for video file changes
watch(
  () => props.videoFile,
  newFile => {
    if (newFile) {
      loadVideo(newFile)
    } else {
      clearVideo()
    }
  },
  { immediate: true }
)

// Cleanup on unmount
onUnmounted(() => {
  clearVideo()
})
</script>
