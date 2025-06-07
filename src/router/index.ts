import { createRouter, createWebHistory } from 'vue-router'
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
    redirect: '/step-1'
  },
  {
    path: '/step-1',
    name: 'Step1',
    component: WorkflowStep1,
    meta: {
      title: 'Upload Video',
      description: 'Upload & extract audio'
    }
  },
  {
    path: '/step-2',
    name: 'Step2',
    component: WorkflowStep2,
    meta: {
      title: 'Generate Subtitles',
      description: 'Speech-to-text transcription'
    }
  },
  {
    path: '/step-3',
    name: 'Step3',
    component: WorkflowStep3,
    meta: {
      title: 'Translate',
      description: 'Translate subtitles'
    }
  },
  {
    path: '/step-4',
    name: 'Step4',
    component: WorkflowStep4,
    meta: {
      title: 'Merge & Download',
      description: 'Style & merge subtitles'
    }
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

export default router
