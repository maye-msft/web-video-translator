<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Workflow Navigation (shown for workflow steps) -->
    <WorkflowNavigation v-if="isWorkflowRoute" />

    <!-- Simple header for test pages -->
    <header
      v-if="!isWorkflowRoute"
      class="bg-white shadow-sm border-b border-gray-200"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="text-xl font-bold text-gray-900">
            Web Video Translator
          </router-link>
          <div class="text-sm text-gray-500">Development Test Page</div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import WorkflowNavigation from './components/WorkflowNavigation.vue'

const route = useRoute()

const isWorkflowRoute = computed(() => {
  return route.path.startsWith('/step-')
})
</script>
