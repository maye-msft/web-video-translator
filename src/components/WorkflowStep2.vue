<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">
          Step 2: Generate Subtitles
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
        Convert your audio to text using AI speech recognition. Choose a Whisper
        model and generate accurate subtitles with timestamps.
      </p>

      <!-- Help Section -->
      <div
        v-if="showHelp"
        class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <h3 class="text-lg font-semibold text-blue-900 mb-3">Step 2 Guide</h3>
        <div class="space-y-2 text-sm text-blue-800">
          <p><strong>What happens in this step:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>Use AI to convert speech to text</li>
            <li>Generate SRT subtitle files with precise timing</li>
            <li>Preview and edit transcription before proceeding</li>
            <li>Download transcription for backup or external use</li>
          </ul>
          <p class="mt-3"><strong>Model Selection:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Tiny:</strong> Fastest, good for clear speech (~39MB)
            </li>
            <li><strong>Base:</strong> Balanced speed and accuracy (~74MB)</li>
            <li><strong>Small:</strong> Better accuracy, slower (~244MB)</li>
            <li>
              <strong>Medium:</strong> High accuracy for complex audio (~769MB)
            </li>
          </ul>
          <p class="mt-3">
            <strong>Tips:</strong> Larger models provide better accuracy but
            take longer to load and process.
          </p>
        </div>
      </div>

      <!-- Audio Source Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Audio Source</h2>

        <!-- Show extracted audio from Step 1 -->
        <div
          v-if="hasExtractedAudio"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm font-medium text-green-800">
              Using audio from Step 1 ({{
                workflowState.artifacts.audioFormat?.toUpperCase()
              }}
              format)
            </span>
          </div>
        </div>

        <!-- Alternative: Upload audio file -->
        <div v-if="!hasExtractedAudio" class="mb-4">
          <p class="text-gray-600 mb-4">
            Upload an audio file to generate subtitles. Supported formats: MP3,
            WAV, M4A, OGG, FLAC up to 100MB.
          </p>
          <AudioUpload
            @file-selected="handleAudioSelected"
            @file-cleared="handleAudioCleared"
            :initial-file="uploadedAudioFile"
          />
        </div>

        <!-- Audio preview -->
        <div v-if="audioURL" class="mt-4">
          <audio :src="audioURL" controls class="w-full" preload="metadata">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      <!-- Model Selection -->
      <div v-if="hasAudioSource" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Choose Whisper Model</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="model in whisperModels"
            :key="model.name"
            class="border rounded-lg p-4 cursor-pointer transition-all"
            :class="
              selectedModel === model.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            "
            @click="selectedModel = model.name"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium">{{ model.displayName }}</h3>
              <input
                type="radio"
                :value="model.name"
                v-model="selectedModel"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ model.description }}</p>
            <p class="text-xs text-gray-500">Size: {{ model.size }}</p>
          </div>
        </div>
      </div>

      <!-- Transcription Section -->
      <div v-if="hasAudioSource && selectedModel" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Generate Transcription</h2>
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Transcribe Button -->
          <button
            @click="startTranscription"
            :disabled="isTranscribing || isModelLoading"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {{ getTranscribeButtonText }}
          </button>

          <!-- Model Loading Progress -->
          <div v-if="isModelLoading" class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span>Loading {{ getSelectedModelName }} model...</span>
              <span>{{ modelLoadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: modelLoadProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Transcription Progress -->
          <div v-if="isTranscribing" class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span>{{ transcriptionStatus }}</span>
              <span>{{ transcriptionProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: transcriptionProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Error Display -->
          <div
            v-if="transcriptionError"
            class="mb-4 bg-red-50 border border-red-200 rounded-md p-3"
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
                  Transcription Error
                </h3>
                <p class="mt-1 text-sm text-red-700">
                  {{ transcriptionError }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transcription Results -->
      <div v-if="transcriptionSRT" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Transcription Results</h2>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
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
                Transcription complete ({{
                  transcriptionSegments.length
                }}
                segments)
              </span>
            </div>
            <button
              @click="downloadSRT"
              class="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Download SRT
            </button>
          </div>
        </div>

        <!-- SRT Preview -->
        <div class="border rounded-lg">
          <div class="p-4 border-b bg-gray-50">
            <h3 class="font-medium">Subtitle Preview</h3>
          </div>
          <div class="p-4">
            <textarea
              v-model="transcriptionSRT"
              @input="handleSRTEdit"
              class="w-full h-64 font-mono text-sm border-0 resize-none focus:ring-0"
              placeholder="Transcription will appear here..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Alternative: Upload SRT -->
      <div v-if="!transcriptionSRT" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Or Upload Existing SRT File</h2>
        <p class="text-gray-600 mb-4">
          Skip transcription by uploading an existing subtitle file.
        </p>
        <SRTInput @content-changed="handleSRTUpload" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AudioUpload from '@/components/AudioUpload.vue'
import SRTInput from '@/components/SRTInput.vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import {
  WHISPER_MODELS,
  generateSRT,
  downloadSRT,
  transcribeAudio,
  isWhisperLoaded,
  getCurrentModelName,
} from '@/utils/whisper'
import type { SubtitleSegment } from '@/utils/translation'

const { workflowState, updateArtifacts, setProcessing, completeStep } =
  useWorkflowState()

// UI state
const showHelp = ref<boolean>(false)

// Reactive state
const uploadedAudioFile = ref<File | null>(workflowState.artifacts.audioFile)
const audioURL = ref<string>('')
const selectedModel = ref<string>(
  workflowState.artifacts.selectedWhisperModel || WHISPER_MODELS[0].name
)
const transcriptionSRT = ref<string>(
  workflowState.artifacts.transcriptionSRT || ''
)
const transcriptionSegments = ref<SubtitleSegment[]>(
  workflowState.artifacts.transcriptionSegments || []
)

// Processing state
const isModelLoading = ref<boolean>(false)
const modelLoadProgress = ref<number>(0)
const isTranscribing = ref<boolean>(false)
const transcriptionProgress = ref<number>(0)
const transcriptionStatus = ref<string>('')
const transcriptionError = ref<string>('')

// Computed properties
const hasExtractedAudio = computed(
  () => workflowState.artifacts.extractedAudio !== null
)
const hasAudioSource = computed(
  () => hasExtractedAudio.value || uploadedAudioFile.value !== null
)
const whisperModels = computed(() => WHISPER_MODELS)

const getSelectedModelName = computed(() => {
  const model = WHISPER_MODELS.find(m => m.name === selectedModel.value)
  return model?.displayName || selectedModel.value
})

const getTranscribeButtonText = computed(() => {
  if (isModelLoading.value) return 'Loading Model...'
  if (isTranscribing.value) return 'Transcribing...'
  if (isWhisperLoaded() && getCurrentModelName() === selectedModel.value) {
    return 'Start Transcription'
  }
  return `Load ${getSelectedModelName.value} & Transcribe`
})

// Setup audio URL on mount
onMounted(() => {
  createAudioURL()
})

// Cleanup on unmount
onUnmounted(() => {
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
  }
})

// Watch for changes to update workflow state
watch([selectedModel, transcriptionSRT, transcriptionSegments], () => {
  updateArtifacts({
    selectedWhisperModel: selectedModel.value,
    transcriptionSRT: transcriptionSRT.value,
    transcriptionSegments: transcriptionSegments.value,
    originalSRT: transcriptionSRT.value, // Also set as original for translation
  })

  // Check if step is complete
  if (transcriptionSRT.value !== '') {
    completeStep(2)
  }
})

// Methods
function createAudioURL() {
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }

  if (hasExtractedAudio.value && workflowState.artifacts.extractedAudio) {
    const format = workflowState.artifacts.audioFormat || 'wav'
    const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
    const blob = new Blob([workflowState.artifacts.extractedAudio], {
      type: mimeType,
    })
    audioURL.value = URL.createObjectURL(blob)
  } else if (uploadedAudioFile.value) {
    audioURL.value = URL.createObjectURL(uploadedAudioFile.value)
  }
}

function handleAudioSelected(file: File) {
  uploadedAudioFile.value = file
  updateArtifacts({ audioFile: file })
  createAudioURL()
}

function handleAudioCleared() {
  uploadedAudioFile.value = null
  updateArtifacts({ audioFile: null })
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
    audioURL.value = ''
  }
}

async function startTranscription() {
  if (!hasAudioSource.value) return

  try {
    setProcessing(true)
    isTranscribing.value = true
    transcriptionError.value = ''
    transcriptionProgress.value = 0
    transcriptionStatus.value = 'Preparing transcription...'

    // Get audio source
    let audioFile: File
    if (uploadedAudioFile.value) {
      audioFile = uploadedAudioFile.value
    } else if (
      hasExtractedAudio.value &&
      workflowState.artifacts.extractedAudio
    ) {
      // Create file from extracted audio
      const format = workflowState.artifacts.audioFormat || 'wav'
      const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
      const blob = new Blob([workflowState.artifacts.extractedAudio], {
        type: mimeType,
      })
      audioFile = new File([blob], `extracted-audio.${format}`, {
        type: mimeType,
      })
    } else {
      throw new Error('No audio source available')
    }

    // Progress callbacks
    const onModelLoad = (progress: number) => {
      isModelLoading.value = true
      modelLoadProgress.value = progress
      transcriptionStatus.value = `Loading ${getSelectedModelName.value} model...`
    }

    const onTranscriptionProgress = (progress: number) => {
      isModelLoading.value = false
      transcriptionProgress.value = progress
      transcriptionStatus.value = `Transcribing audio... ${progress}%`
    }

    // Start transcription
    const result = await transcribeAudio(
      audioFile,
      selectedModel.value,
      onModelLoad,
      onTranscriptionProgress
    )

    // Generate SRT from result
    const srtContent = generateSRT(result)
    transcriptionSRT.value = srtContent

    // Convert to segments for workflow state
    const segments = result.chunks.map((chunk, index) => ({
      index: index + 1,
      startTime: formatTimestamp(chunk.timestamp[0]),
      endTime: formatTimestamp(chunk.timestamp[1]),
      text: chunk.text.trim(),
      timestamp: chunk.timestamp,
    }))

    transcriptionSegments.value = segments
    transcriptionStatus.value = 'Transcription complete!'
    transcriptionProgress.value = 100
  } catch (error) {
    console.error('Transcription failed:', error)
    transcriptionError.value =
      error instanceof Error ? error.message : 'Transcription failed'
  } finally {
    isTranscribing.value = false
    isModelLoading.value = false
    setProcessing(false)
  }
}

function handleSRTEdit() {
  // Update workflow state when user edits SRT
  updateArtifacts({
    transcriptionSRT: transcriptionSRT.value,
    originalSRT: transcriptionSRT.value,
  })
}

function handleSRTUpload(segments: SubtitleSegment[], rawContent: string) {
  transcriptionSRT.value = rawContent
  transcriptionSegments.value = segments

  updateArtifacts({
    transcriptionSRT: rawContent,
    transcriptionSegments: segments,
    originalSRT: rawContent,
  })
}

function downloadSRT() {
  if (transcriptionSRT.value) {
    downloadSRT(transcriptionSRT.value, 'transcription.srt')
  }
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}
</script>
