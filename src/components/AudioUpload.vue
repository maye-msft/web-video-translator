<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Upload Audio File</h2>

    <!-- File Drop Zone -->
    <div
      data-testid="audio-drop-zone"
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200"
      :class="dropZoneClasses"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @dragenter="handleDragEnter"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Upload Icon and Text -->
      <div v-if="!selectedFile" class="text-gray-500">
        <svg
          class="mx-auto h-12 w-12 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <p class="text-sm font-medium">
          {{
            isDragOver
              ? 'Drop your audio file here'
              : 'Drop your audio file here or click to browse'
          }}
        </p>
        <p class="text-xs text-gray-400 mt-2">
          MP3, WAV, M4A, OGG, FLAC supported (max 100MB)
        </p>
      </div>

      <!-- File Selected State -->
      <div v-else class="text-gray-700">
        <svg
          class="mx-auto h-12 w-12 mb-4 text-green-500"
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
        <p class="text-sm font-medium text-green-700">
          {{ selectedFile.name }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ formatFileSize(selectedFile.size) }}
        </p>
        <button
          @click.stop="clearFile"
          class="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Remove file
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
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
        <p class="ml-2 text-sm text-red-700">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Processing State -->
    <div
      v-if="isProcessing"
      class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
    >
      <div class="flex items-center">
        <div
          class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
        ></div>
        <p class="ml-2 text-sm text-blue-700">Processing audio file...</p>
      </div>
    </div>

    <!-- Audio Preview -->
    <div v-if="selectedFile && audioUrl" class="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Audio Preview</h4>
      <audio
        :src="audioUrl"
        controls
        class="w-full"
        preload="metadata"
        @loadedmetadata="handleAudioLoaded"
        @error="handleAudioError"
      />

      <!-- Audio Info -->
      <div v-if="audioInfo" class="mt-2 text-xs text-gray-600 space-y-1">
        <div class="flex justify-between">
          <span>Duration:</span>
          <span>{{ formatDuration(audioInfo.duration) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Format:</span>
          <span>{{ selectedFile.type || 'Unknown' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// Props and Emits
interface Props {
  initialFile?: File | null
}

const props = withDefaults(defineProps<Props>(), {
  initialFile: null,
})

const emit = defineEmits<{
  fileSelected: [file: File]
  fileCleared: []
  error: [message: string]
}>()

// Reactive state
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(props.initialFile)
const isDragOver = ref(false)
const errorMessage = ref('')
const isProcessing = ref(false)
const audioUrl = ref('')
const audioInfo = ref<{
  duration: number
} | null>(null)
const isInitialized = ref(false)

// Watch for initialFile changes
watch(
  () => props.initialFile,
  newFile => {
    if (newFile !== selectedFile.value) {
      selectedFile.value = newFile
      if (newFile) {
        // Create audio URL for preview if we have a file
        if (audioUrl.value) {
          URL.revokeObjectURL(audioUrl.value)
        }
        audioUrl.value = URL.createObjectURL(newFile)
      } else {
        // Clear audio URL if no file
        if (audioUrl.value) {
          URL.revokeObjectURL(audioUrl.value)
          audioUrl.value = ''
        }
        audioInfo.value = null
      }
    }
  },
  { immediate: true }
)

// Initialize from props on mount
onMounted(() => {
  if (props.initialFile) {
    selectedFile.value = props.initialFile
    audioUrl.value = URL.createObjectURL(props.initialFile)
  }
  isInitialized.value = true
})

// Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const SUPPORTED_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
]

// Computed
const dropZoneClasses = computed(() => ({
  'border-gray-300 hover:border-blue-400':
    !isDragOver.value && !selectedFile.value,
  'border-blue-500 bg-blue-50': isDragOver.value,
  'border-green-500 bg-green-50': selectedFile.value,
  'cursor-pointer': !selectedFile.value,
}))

// Methods
const triggerFileInput = () => {
  if (!selectedFile.value) {
    fileInput.value?.click()
  }
}

const validateFile = (file: File): string | null => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size too large. Maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.`
  }

  // Check file type
  const isSupported =
    SUPPORTED_TYPES.includes(file.type) ||
    /\.(mp3|wav|m4a|ogg|flac)$/i.test(file.name)

  if (!isSupported) {
    return 'Unsupported file format. Please select MP3, WAV, M4A, OGG, or FLAC files.'
  }

  return null
}

const processFile = async (file: File) => {
  errorMessage.value = ''

  // Validate file
  const validationError = validateFile(file)
  if (validationError) {
    errorMessage.value = validationError
    emit('error', validationError)
    return
  }

  isProcessing.value = true

  try {
    // Create audio URL for preview
    audioUrl.value = URL.createObjectURL(file)
    selectedFile.value = file
    emit('fileSelected', file)
  } catch (error) {
    errorMessage.value = 'Failed to process audio file.'
    emit('error', 'Failed to process audio file.')
  } finally {
    isProcessing.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const clearFile = () => {
  selectedFile.value = null
  errorMessage.value = ''
  audioInfo.value = null

  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = ''
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  emit('fileCleared')
}

const handleAudioLoaded = (event: Event) => {
  const audio = event.target as HTMLAudioElement
  audioInfo.value = {
    duration: audio.duration,
  }
}

const handleAudioError = () => {
  errorMessage.value =
    'Failed to load audio file. The file may be corrupted or in an unsupported format.'
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

// Expose methods for parent component
defineExpose({
  clearFile,
  selectedFile: computed(() => selectedFile.value),
})
</script>
