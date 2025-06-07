<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Subtitle Input</h3>

    <!-- Input Method Selection -->
    <div class="mb-4">
      <div class="flex space-x-4">
        <button
          @click="inputMethod = 'paste'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            inputMethod === 'paste'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Paste Text
        </button>
        <button
          @click="inputMethod = 'upload'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            inputMethod === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          Upload SRT File
        </button>
      </div>
    </div>

    <!-- Paste Text Input -->
    <div v-if="inputMethod === 'paste'" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Paste SRT Content or Plain Text
        </label>
        <textarea
          v-model="pastedContent"
          @input="handlePastedContent"
          placeholder="Paste your SRT content here or enter plain text to translate..."
          class="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
        ></textarea>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-500">
          {{
            pastedContent
              ? `${pastedContent.split('\n').length} lines`
              : 'No content'
          }}
        </span>
        <button
          v-if="pastedContent"
          @click="clearContent"
          class="text-sm text-red-600 hover:text-red-700"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- File Upload Input -->
    <div v-if="inputMethod === 'upload'">
      <div
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        :class="[
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
        ]"
        @dragenter="isDragOver = true"
        @dragleave="isDragOver = false"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".srt,.txt"
          @change="handleFileSelect"
          class="hidden"
        />

        <div class="space-y-2">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div>
            <p class="text-lg text-gray-600">
              Drop your SRT file here, or
              <button
                @click="$refs.fileInput?.click()"
                class="text-blue-600 hover:text-blue-700 underline"
              >
                browse
              </button>
            </p>
            <p class="text-sm text-gray-500">Supports SRT and TXT files</p>
          </div>
        </div>
      </div>

      <!-- Selected File Info -->
      <div
        v-if="selectedFile"
        class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="text-sm font-medium text-green-800">{{
              selectedFile.name
            }}</span>
          </div>
          <button
            @click="clearFile"
            class="text-sm text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
        <p class="text-xs text-green-600 mt-1">
          {{ formatFileSize(selectedFile.size) }} •
          {{ selectedFile.type || 'text/plain' }}
        </p>
      </div>
    </div>

    <!-- Content Preview -->
    <div v-if="processedContent" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Content Preview</h4>
      <div class="text-sm text-gray-600 max-h-32 overflow-y-auto">
        <pre class="whitespace-pre-wrap font-mono">{{ contentPreview }}</pre>
      </div>
      <div class="mt-2 text-xs text-gray-500">
        {{ segments.length }} segments detected
      </div>
    </div>

    <!-- Error Display -->
    <div
      v-if="error"
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
          <h4 class="text-sm font-medium text-red-800">Input Error</h4>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseSRT, type SubtitleSegment } from '../utils/translation'

// Props and emits
const emit = defineEmits<{
  'content-changed': [segments: SubtitleSegment[], rawContent: string]
  error: [error: string]
}>()

// Reactive state
const inputMethod = ref<'paste' | 'upload'>('paste')
const pastedContent = ref('')
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const error = ref('')

// File input reference
const fileInput = ref<HTMLInputElement>()

// Computed properties
const processedContent = computed(() => {
  if (inputMethod.value === 'paste') {
    return pastedContent.value.trim()
  } else if (selectedFile.value) {
    return 'File selected, content will be processed when read'
  }
  return ''
})

const segments = computed(() => {
  if (!processedContent.value || inputMethod.value === 'upload') {
    return []
  }

  try {
    return parseSRT(processedContent.value)
  } catch {
    // If SRT parsing fails, treat as plain text
    const lines = processedContent.value.split('\n').filter(line => line.trim())
    return lines.map((line, index) => ({
      index: index + 1,
      startTime: '00:00:00,000',
      endTime: '00:00:05,000',
      text: line.trim(),
      timestamp: [index * 5, (index + 1) * 5] as [number, number],
    }))
  }
})

const contentPreview = computed(() => {
  if (segments.value.length === 0) {
    return (
      processedContent.value.slice(0, 200) +
      (processedContent.value.length > 200 ? '...' : '')
    )
  }

  return (
    segments.value
      .slice(0, 3)
      .map(
        segment =>
          `${segment.index}\n${segment.startTime} --> ${segment.endTime}\n${segment.text}`
      )
      .join('\n\n') + (segments.value.length > 3 ? '\n\n...' : '')
  )
})

// Watch for changes and emit events
watch(
  [segments, processedContent],
  () => {
    if (processedContent.value) {
      error.value = ''
      emit('content-changed', segments.value, processedContent.value)
    }
  },
  { deep: true }
)

// Methods
const handlePastedContent = () => {
  if (pastedContent.value.trim()) {
    error.value = ''
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

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (
      file.type === 'text/plain' ||
      file.name.endsWith('.srt') ||
      file.name.endsWith('.txt')
    ) {
      processFile(file)
    } else {
      error.value = 'Please select a text file (.srt or .txt)'
    }
  }
}

const processFile = async (file: File) => {
  selectedFile.value = file
  error.value = ''

  try {
    const content = await readFileAsText(file)
    const fileSegments = parseSRT(content)

    if (fileSegments.length === 0) {
      // Treat as plain text if SRT parsing fails
      const lines = content.split('\n').filter(line => line.trim())
      const plainTextSegments = lines.map((line, index) => ({
        index: index + 1,
        startTime: '00:00:00,000',
        endTime: '00:00:05,000',
        text: line.trim(),
        timestamp: [index * 5, (index + 1) * 5] as [number, number],
      }))
      emit('content-changed', plainTextSegments, content)
    } else {
      emit('content-changed', fileSegments, content)
    }
  } catch (err) {
    error.value = `Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`
    emit('error', error.value)
  }
}

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

const clearContent = () => {
  pastedContent.value = ''
  error.value = ''
  emit('content-changed', [], '')
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  error.value = ''
  emit('content-changed', [], '')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
