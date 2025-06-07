<template>
  <div class="container mx-auto px-4 py-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Web Video Translator
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Extract, edit, translate, and merge subtitles for videos directly in your browser.
        Upload a video, extract subtitles, translate them, and create a new video with embedded subtitles.
      </p>
    </header>

    <main class="max-w-4xl mx-auto">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Video Upload Section -->
        <VideoUpload 
          @file-selected="handleFileSelected"
          @file-cleared="handleFileCleared"
          @error="handleUploadError"
        />

        <!-- Subtitle Management Section -->
        <section class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            2. Subtitle Management
          </h2>
          <div class="space-y-4">
            <button 
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
              :disabled="!selectedFile"
            >
              Extract Subtitles
            </button>
            <button 
              class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50" 
              :disabled="!selectedFile"
            >
              Translate Subtitles
            </button>
            <button 
              class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50" 
              :disabled="!selectedFile"
            >
              Download SRT File
            </button>
          </div>
        </section>
      </div>

      <!-- Video Information Display -->
      <VideoInfo :video-file="selectedFile" />

      <!-- Subtitle Editor Section -->
      <section class="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          3. Subtitle Editor
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Original Subtitles
            </label>
            <textarea 
              class="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Original subtitles will appear here after extraction..."
              readonly
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Translated Subtitles
            </label>
            <textarea 
              class="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Translated subtitles will appear here..."
            ></textarea>
          </div>
        </div>
      </section>

      <!-- Video Generation Section -->
      <section class="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          4. Generate Video with Subtitles
        </h2>
        <div class="text-center">
          <button class="bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50" disabled>
            Generate Video with Subtitles
          </button>
          <p class="text-sm text-gray-500 mt-2">
            This will create a new video with embedded subtitles
          </p>
        </div>
      </section>
    </main>

    <footer class="text-center mt-12 text-gray-500">
      <p>Powered by WebAssembly and Transformer.js</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VideoUpload from './VideoUpload.vue'
import VideoInfo from './VideoInfo.vue'

// State
const selectedFile = ref<File | null>(null)
const uploadError = ref('')

// Event handlers
const handleFileSelected = (file: File) => {
  selectedFile.value = file
  uploadError.value = ''
}

const handleFileCleared = () => {
  selectedFile.value = null
  uploadError.value = ''
}

const handleUploadError = (error: string) => {
  uploadError.value = error
  selectedFile.value = null
}
</script>