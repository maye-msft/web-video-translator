<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <!-- CLI Workflow Section -->
    <div class="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span
          class="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3"
          >⚡</span
        >
        CLI Video Translation Workflow
      </h1>
      <p class="text-gray-700 mb-6">
        Fast and efficient command-line approach for developers and power users:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Step 1: FFmpeg -->
        <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center mb-4">
            <span
              class="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3"
              >1</span
            >
            <h3 class="text-lg font-semibold text-gray-900">Extract Audio</h3>
          </div>
          <p class="text-sm text-gray-600 mb-3">
            Use FFmpeg to extract audio from your video file:
          </p>
          <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code class="text-green-400 text-sm font-mono"
              >ffmpeg -i input_video.mp4 -vn -acodec pcm_s16le -ar 16000
              audio.wav</code
            >
          </div>
        </div>

        <!-- Step 2: Whisper -->
        <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center mb-4">
            <span
              class="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3"
              >2</span
            >
            <h3 class="text-lg font-semibold text-gray-900">
              Generate Subtitles
            </h3>
          </div>
          <p class="text-sm text-gray-600 mb-3">
            Install Whisper and generate SRT subtitles:
          </p>
          <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto space-y-2">
            <div>
              <code class="text-blue-400 text-sm font-mono"
                ># Install Whisper first</code
              >
            </div>
            <div>
              <code class="text-green-400 text-sm font-mono"
                >pip install openai-whisper</code
              >
            </div>
            <div>
              <code class="text-blue-400 text-sm font-mono"
                ># Extract subtitles</code
              >
            </div>
            <div>
              <code class="text-green-400 text-sm font-mono"
                >whisper audio.wav --model medium --output_format srt</code
              >
            </div>
          </div>
        </div>

        <!-- Step 3: ChatGPT -->
        <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center mb-4">
            <span
              class="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3"
              >3</span
            >
            <h3 class="text-lg font-semibold text-gray-900">
              Translate with AI
            </h3>
          </div>
          <p class="text-sm text-gray-600 mb-3">
            Use ChatGPT to translate your subtitles:
          </p>
          <div class="space-y-2 text-sm">
            <div class="flex items-start">
              <span
                class="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"
              ></span>
              <span
                >Copy the generated
                <code class="bg-gray-100 px-1 rounded">.srt</code> file
                content</span
              >
            </div>
            <div class="flex items-start">
              <span
                class="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"
              ></span>
              <div>
                Paste into ChatGPT with prompt:
                <div
                  class="bg-blue-50 border-l-4 border-blue-400 p-3 mt-2 italic text-blue-800"
                >
                  "Translate this SRT subtitle file to [target language],
                  keeping the timestamp format intact"
                </div>
              </div>
            </div>
            <div class="flex items-start">
              <span
                class="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"
              ></span>
              <span
                >Save output as
                <code class="bg-gray-100 px-1 rounded"
                  >translated_subtitles.srt</code
                ></span
              >
            </div>
          </div>
        </div>

        <!-- Step 4: VLC -->
        <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center mb-4">
            <span
              class="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-3"
              >4</span
            >
            <h3 class="text-lg font-semibold text-gray-900">
              Play with Subtitles
            </h3>
          </div>
          <p class="text-sm text-gray-600 mb-3">
            Watch your video with translated subtitles in VLC:
          </p>
          <div class="space-y-2 text-sm">
            <div class="flex items-start">
              <span
                class="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"
              ></span>
              <span>Open your video in VLC</span>
            </div>
            <div class="flex items-start">
              <span
                class="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"
              ></span>
              <span>Go to <strong>Subtitle → Add Subtitle File</strong></span>
            </div>
            <div class="flex items-start">
              <span
                class="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"
              ></span>
              <span
                >Select your
                <code class="bg-gray-100 px-1 rounded"
                  >translated_subtitles.srt</code
                >
                file</span
              >
            </div>
            <div class="flex items-start">
              <span
                class="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"
              ></span>
              <span class="text-green-600 font-medium"
                >Subtitles appear automatically! 🎉</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alternative Web-Based Workflow Section -->
    <div class="bg-blue-50 rounded-lg border border-blue-200 p-6">
      <h2 class="text-xl font-semibold text-blue-900 mb-4">
        💻 Alternative: Web-Based Workflow (Steps 1-4)
      </h2>
      <p class="text-blue-800 mb-4">
        Prefer a graphical interface? Use our web-based workflow that does
        everything in your browser:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 border border-blue-100">
          <div class="flex items-center mb-2">
            <span
              class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-2"
              >1</span
            >
            <h3 class="font-medium text-gray-900">Upload Video</h3>
          </div>
          <p class="text-sm text-gray-600">
            Upload your video file and extract audio automatically using FFmpeg
            WASM
          </p>
        </div>

        <div class="bg-white rounded-lg p-4 border border-blue-100">
          <div class="flex items-center mb-2">
            <span
              class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-2"
              >2</span
            >
            <h3 class="font-medium text-gray-900">Generate Subtitles</h3>
          </div>
          <p class="text-sm text-gray-600">
            Convert speech to text using Whisper AI models running directly in
            your browser
          </p>
        </div>

        <div class="bg-white rounded-lg p-4 border border-blue-100">
          <div class="flex items-center mb-2">
            <span
              class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-2"
              >3</span
            >
            <h3 class="font-medium text-gray-900">Translate</h3>
          </div>
          <p class="text-sm text-gray-600">
            Translate subtitles to 100+ languages using MarianMT models with
            built-in editor
          </p>
        </div>

        <div class="bg-white rounded-lg p-4 border border-blue-100">
          <div class="flex items-center mb-2">
            <span
              class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-2"
              >4</span
            >
            <h3 class="font-medium text-gray-900">Merge & Download</h3>
          </div>
          <p class="text-sm text-gray-600">
            Style your subtitles and merge them back into the video for final
            download
          </p>
        </div>
      </div>

      <div class="mt-4 flex justify-center">
        <router-link
          to="/step-1"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
          Start Web-Based Workflow
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for static instructions
</script>
