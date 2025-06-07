import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '../components/IndexPage.vue'
import FFmpegTest from '../components/FFmpegTest.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory('/web-video-translator/'),
  routes
})

export default router