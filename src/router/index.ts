import { createRouter, createWebHistory } from 'vue-router'
import { useWorkflowState } from '../composables/useWorkflowState'
import type { WorkflowStep } from '../composables/useWorkflowState'
import WorkflowStep0 from '../components/WorkflowStep0.vue'
import WorkflowStep1 from '../components/WorkflowStep1.vue'
import WorkflowStep2 from '../components/WorkflowStep2.vue'
import WorkflowStep3 from '../components/WorkflowStep3.vue'
import WorkflowStep4 from '../components/WorkflowStep4.vue'

// Keep test pages for development/debugging
import FFmpegTest from '../components/FFmpegTest.vue'
import WhisperTest from '../components/WhisperTest.vue'
import MarianMTTest from '../components/MarianMTTest.vue'
import SubtitleMerge from '../components/SubtitleMerge.vue'

const routes = [
  {
    path: '/',
    redirect: '/step-1',
  },
  {
    path: '/step-0',
    name: 'Step0',
    component: WorkflowStep0,
    meta: {
      title: 'Technical (CLI Tools)',
      description: 'ffmpeg, Whisper, ChatGPT',
    },
  },
  {
    path: '/step-1',
    name: 'Step1',
    component: WorkflowStep1,
    meta: {
      title: 'Upload Video',
      description: 'Upload & extract audio',
    },
  },
  {
    path: '/step-2',
    name: 'Step2',
    component: WorkflowStep2,
    meta: {
      title: 'Generate Subtitles',
      description: 'Speech-to-text transcription',
    },
  },
  {
    path: '/step-3',
    name: 'Step3',
    component: WorkflowStep3,
    meta: {
      title: 'Translate',
      description: 'Translate subtitles',
    },
  },
  {
    path: '/step-4',
    name: 'Step4',
    component: WorkflowStep4,
    meta: {
      title: 'Merge & Download',
      description: 'Style & merge subtitles',
    },
  },
  // Keep test pages for development (hidden from main navigation)
  {
    path: '/ffmpeg-test',
    name: 'FFmpegTest',
    component: FFmpegTest,
  },
  {
    path: '/whisper-test',
    name: 'WhisperTest',
    component: WhisperTest,
  },
  {
    path: '/translation-test',
    name: 'MarianMTTest',
    component: MarianMTTest,
  },
  {
    path: '/subtitle-merge',
    name: 'SubtitleMerge',
    component: SubtitleMerge,
  },
]

const router = createRouter({
  history: createWebHistory('/web-video-translator/'),
  routes,
})

// Navigation guard to sync current step with route
router.beforeEach(to => {
  const { jumpToStep, initializeState } = useWorkflowState()

  // First load the saved state (but don't overwrite currentStep yet)
  let routeStep: WorkflowStep | null = null

  // Extract step number from route path
  if (to.path.startsWith('/step-')) {
    const stepMatch = to.path.match(/\/step-(\d+)/)
    if (stepMatch) {
      const stepNumber = parseInt(stepMatch[1]) as WorkflowStep
      // Only update if it's a valid step (0-4)
      if (stepNumber >= 0 && stepNumber <= 4) {
        routeStep = stepNumber
        jumpToStep(stepNumber)
      }
    }
  }

  // Initialize state from storage, but preserve the route step if we set one
  initializeState(routeStep !== null)
})

export default router
