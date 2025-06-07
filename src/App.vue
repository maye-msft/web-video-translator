<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/" class="text-xl font-bold text-gray-900">
              Web Video Translator
            </router-link>
            <div class="flex space-x-4">
              <router-link
                to="/"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'Home' }"
              >
                Main App
              </router-link>
              <router-link
                to="/ffmpeg-test"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{
                  'text-blue-600 bg-blue-50': $route.name === 'FFmpegTest',
                }"
              >
                FFmpeg Test
              </router-link>
              <router-link
                to="/whisper-test"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{
                  'text-blue-600 bg-blue-50': $route.name === 'WhisperTest',
                }"
              >
                Whisper Test
              </router-link>
              <router-link
                to="/translation-test"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                :class="{
                  'text-blue-600 bg-blue-50': $route.name === 'MarianMTTest',
                }"
              >
                Translation Test
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// Navigation handled by Vue Router
</script>
