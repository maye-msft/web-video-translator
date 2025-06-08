<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <!-- Test Case 12: Add WorkflowStep2 Header and Help Section -->
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">
          Step Test: Header + Help Section
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

        <!-- Unified Audio Source Selection Panel -->
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Option 1: Use Audio from Step 1 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="audioSource"
                  type="radio"
                  value="step1"
                  :disabled="!hasExtractedAudio"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Use Audio from Step 1
                </span>
              </label>
              <div
                v-if="hasExtractedAudio"
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
                {{ workflowState.artifacts.audioFormat?.toUpperCase() }} format,
                {{
                  formatFileSize(
                    workflowState.artifacts.extractedAudio?.byteLength || 0
                  )
                }}
              </div>
            </div>

            <div v-if="!hasExtractedAudio" class="ml-7 text-sm text-gray-500">
              No audio available from Step 1. Complete Step 1 first or upload
              audio below.
            </div>
          </div>

          <!-- Option 2: Upload Audio File -->
          <div>
            <div class="flex items-center mb-3">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="audioSource"
                  type="radio"
                  value="upload"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span class="ml-3 text-sm font-medium text-gray-900">
                  Upload Audio File
                </span>
              </label>
            </div>

            <div v-if="audioSource === 'upload'" class="ml-7">
              <p class="text-sm text-gray-600 mb-3">
                Upload your own audio file for transcription. Supported formats:
                MP3, WAV, M4A, OGG, FLAC up to 100MB.
              </p>
              <AudioUpload
                @file-selected="handleAudioSelected"
                @file-cleared="handleAudioCleared"
                :initial-file="uploadedAudioFile"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Model Selection -->
      <div v-if="hasAudioSource" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Choose Whisper Model</h2>
        <div class="max-w-md">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Whisper Model
          </label>
          <select
            v-model="selectedModel"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          >
            <option
              v-for="model in whisperModels"
              :key="model.name"
              :value="model.name"
            >
              {{ model.displayName }} ({{ model.size }})
            </option>
          </select>

          <!-- Selected Model Description -->
          <div v-if="selectedModelInfo" class="mt-3 p-3 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-1">
              {{ selectedModelInfo.displayName }}
            </h4>
            <p class="text-sm text-gray-600 mb-2">
              {{ selectedModelInfo.description }}
            </p>
            <p class="text-xs text-gray-500">
              Model Size: {{ selectedModelInfo.size }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-green-100 p-4 rounded mb-4">
        <p>If you can see this, the page loaded successfully!</p>
        <p>Current time: {{ new Date().toISOString() }}</p>
        <p>Test Value: {{ testValue }}</p>
        <p>Show Help: {{ showHelp }}</p>
      </div>
      
      <!-- Test Case 7: Add AudioUpload component -->
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-4">Test AudioUpload Component</h3>
        <AudioUpload 
          @file-selected="handleAudioSelected"
          @file-cleared="handleAudioCleared"
          :initial-file="uploadedAudioFile"
        />
      </div>

      <!-- Transcription Section -->
      <div v-if="hasAudioSource && selectedModel" class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Generate Transcription</h2>
        <div class="bg-gray-50 rounded-lg p-6">
          <!-- Generate Subtitles Button (with automatic model initialization) -->
          <button
            @click="startTranscriptionWithAutoInit"
            :disabled="isTranscribing || isModelLoading"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {{ getTranscribeButtonText }}
          </button>

          <!-- Multi-Stage Progress System (inspired by whisper-web) -->

          <!-- Model Loading Progress Items -->
          <div
            v-if="progressItems.length > 0"
            class="mb-4 space-y-2"
            data-testid="progress-items"
          >
            <div class="text-sm font-medium text-gray-700 mb-2">
              Loading model files... (only runs once)
            </div>
            <div
              v-for="item in progressItems"
              :key="item.file"
              class="bg-blue-50 rounded-lg p-3"
            >
              <div class="flex justify-between text-xs mb-1">
                <span class="text-blue-800">{{ item.name || item.file }}</span>
                <span class="text-blue-600"
                  >{{ Math.round(item.progress) }}%</span
                >
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: item.progress + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Audio Processing Progress -->
          <div
            v-if="isAudioProcessing"
            class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            data-testid="audio-processing"
          >
            <div class="flex justify-between text-sm font-medium mb-2">
              <span class="text-yellow-800">Processing audio file...</span>
              <span class="text-yellow-600"
                >{{ audioProcessingProgress }}%</span
              >
            </div>
            <div class="w-full bg-yellow-200 rounded-full h-3">
              <div
                class="bg-yellow-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: audioProcessingProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Transcription Progress -->
          <div
            v-if="isTranscribing"
            class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            data-testid="transcription-progress"
          >
            <div class="flex justify-between text-sm font-medium mb-2">
              <span class="text-green-800">{{ transcriptionStatus }}</span>
              <span class="text-green-600">{{ transcriptionProgress }}%</span>
            </div>

            <!-- Main Progress Bar -->
            <div class="w-full bg-green-200 rounded-full h-4 shadow-inner mb-3">
              <div
                class="bg-green-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                :style="{ width: transcriptionProgress + '%' }"
              ></div>
            </div>

            <!-- Chunk Progress Details -->
            <div v-if="chunkInfo" class="space-y-2">
              <div class="flex justify-between text-xs text-green-700">
                <span>Processing chunks:</span>
                <span
                  >{{ chunkInfo.currentChunk }} /
                  {{ chunkInfo.totalChunks }}</span
                >
              </div>

              <!-- Individual Chunk Progress -->
              <div class="w-full bg-green-100 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: chunkInfo.chunkProgress + '%' }"
                ></div>
              </div>

              <!-- Current Chunk Text Preview -->
              <div
                v-if="chunkInfo.chunkText"
                class="text-xs text-green-600 italic truncate"
              >
                Current: "{{ chunkInfo.chunkText.slice(0, 60)
                }}{{ chunkInfo.chunkText.length > 60 ? '...' : '' }}"
              </div>
            </div>

            <div class="text-xs text-green-700 mt-2">
              {{ getTranscriptionStageText() }}
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
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                class="h-5 w-5 text-green-600 mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-sm font-medium text-green-800">
                Transcription complete
              </span>
            </div>
            <button
              @click="downloadTranscriptionSRT"
              class="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Download SRT
            </button>
          </div>
        </div>

        <!-- Subtitle Editor -->
        <div class="border rounded-lg">
          <div class="p-4 border-b bg-gray-50">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Edit Subtitles (SRT)</span>
              <span class="text-xs text-gray-500">Word count: {{ getWordCount() }}</span>
            </div>
          </div>
          <div class="relative">
            <textarea
              ref="srtEditor"
              v-model="transcriptionSRT"
              @input="handleSRTEdit"
              @keydown="handleEditorKeydown"
              rows="12"
              class="w-full p-4 text-sm border-0 rounded-b-lg focus:ring-2 focus:ring-blue-500 bg-white font-mono resize-y"
              spellcheck="true"
            ></textarea>

            <!-- Auto-save indicator -->
            <div
              v-if="isAutoSaving"
              class="absolute top-2 right-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
            >
              Saving...
            </div>
            <div
              v-else-if="lastSaved"
              class="absolute top-2 right-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded"
            >
              Saved {{ getTimeAgo(lastSaved) }}
            </div>
          </div>

          <!-- Validation messages -->
          <div
            v-if="validationErrors.length > 0"
            class="p-4 border-t bg-red-50"
          >
            <h4 class="text-sm font-medium text-red-800 mb-2">
              Validation Errors
            </h4>
            <ul class="text-xs text-red-700 space-y-1">
              <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
            </ul>
          </div>

          <!-- Editor help -->
          <div class="p-4 border-t bg-blue-50">
            <details class="text-sm">
              <summary class="cursor-pointer">SRT Editing Tips</summary>
              <ul class="list-disc ml-5 mt-2">
                <li>Each subtitle block should have a number, time range, and text.</li>
                <li>Use the format: <code>00:00:00,000 --> 00:00:05,000</code></li>
                <li>Separate blocks with a blank line.</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
      <!-- ...existing code... -->
    </div>
  </div>
</template>

<script setup lang="ts">
// Test Case 5: Add AudioUpload component (testing component imports)
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AudioUpload from '@/components/AudioUpload.vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import {
  WHISPER_MODELS,
  generateSRT,
  downloadSRT,
  preprocessAudio,
} from '@/utils/whisper'
// Dynamic import of whisperService to prevent auto-loading
import type { SubtitleSegment } from '@/utils/translation'
import { formatFileSize } from '@/utils/translation'

console.log('WorkflowStepTest with dynamic service import loaded at:', new Date().toISOString())
console.log('Whisper modes