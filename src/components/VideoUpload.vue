<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      1. Upload Video
    </h2>
    
    <!-- File Drop Zone -->
    <div 
      data-testid="drop-zone"
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
        accept="video/*,.mp4,.webm,.avi,.mov"
        class="hidden"
        @change="handleFileSelect"
      />
      
      <!-- Upload Icon and Text -->
      <div v-if="!selectedFile" class="text-gray-500">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm font-medium">
          {{ isDragOver ? 'Drop your video file here' : 'Drop your video file here or click to browse' }}
        </p>
        <p class="text-xs text-gray-400 mt-2">MP4, WebM, AVI, MOV supported (max 500MB)</p>
      </div>
      
      <!-- File Selected State -->
      <div v-else class="text-gray-700">
        <svg class="mx-auto h-12 w-12 mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-green-700">{{ selectedFile.name }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(selectedFile.size) }}</p>
        <button 
          @click.stop="clearFile"
          class="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Remove file
        </button>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="ml-2 text-sm text-red-700">{{ errorMessage }}</p>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isProcessing" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <p class="ml-2 text-sm text-blue-700">Processing video...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props and Emits
const emit = defineEmits<{
  fileSelected: [file: File]
  fileCleared: []
  error: [message: string]
}>()

// Reactive state
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const errorMessage = ref('')
const isProcessing = ref(false)

// Constants
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
const SUPPORTED_TYPES = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime', 'video/x-msvideo']

// Computed
const dropZoneClasses = computed(() => ({
  'border-gray-300 hover:border-blue-400': !isDragOver.value && !selectedFile.value,
  'border-blue-500 bg-blue-50': isDragOver.value,
  'border-green-500 bg-green-50': selectedFile.value,
  'cursor-pointer': !selectedFile.value
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
  if (!SUPPORTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|webm|avi|mov)$/i)) {
    return 'Unsupported file format. Please select MP4, WebM, AVI, or MOV files.'
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
    selectedFile.value = file
    emit('fileSelected', file)
  } catch (error) {
    errorMessage.value = 'Failed to process video file.'
    emit('error', 'Failed to process video file.')
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
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('fileCleared')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Expose methods for parent component
defineExpose({
  clearFile,
  selectedFile: computed(() => selectedFile.value)
})
</script>