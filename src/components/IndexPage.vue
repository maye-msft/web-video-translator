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
        <section class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            1. Upload Video
          </h2>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm">Drop your video file here or click to browse</p>
              <p class="text-xs text-gray-400 mt-2">MP4, WebM, AVI supported</p>
            </div>
          </div>
        </section>

        <!-- Subtitle Management Section -->
        <section class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            2. Subtitle Management
          </h2>
          <div class="space-y-4">
            <button class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" disabled>
              Extract Subtitles
            </button>
            <button class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50" disabled>
              Translate Subtitles
            </button>
            <button class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50" disabled>
              Download SRT File
            </button>
          </div>
        </section>
      </div>

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
// Component logic will be added in future user stories
</script>