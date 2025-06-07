import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '../components/IndexPage.vue'
import FFmpegTest from '../components/FFmpegTest.vue'
import WhisperTest from '../components/WhisperTest.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: IndexPage
  },
  {
    path: '/ffmpeg-test',
    name: 'FFmpegTest',
    component: FFmpegTest
  },
  {
    path: '/whisper-test',
    name: 'WhisperTest',
    component: WhisperTest
  }
]

const router = createRouter({
  history: createWebHistory('/web-video-translator/'),
  routes
})

export default router