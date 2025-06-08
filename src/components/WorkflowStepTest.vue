<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Step Test: Minimal Page
      </h1>
      <p class="text-gray-600 mb-4">
        This is a minimal test page to isolate loading issues.
      </p>
      <div class="bg-green-100 p-4 rounded">
        <p>If you can see this, the page loaded successfully!</p>
        <p>Current time: {{ new Date().toISOString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Minimal script with no imports to test basic page loading
console.log('WorkflowStepTest loaded at:', new Date().toISOString())
</script>