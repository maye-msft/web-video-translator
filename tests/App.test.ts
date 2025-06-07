import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../src/App.vue'
import IndexPage from '../src/components/IndexPage.vue'

// Create mock router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: IndexPage, name: 'Home' },
    { path: '/ffmpeg-test', component: { template: '<div>FFmpeg Test</div>' }, name: 'FFmpegTest' }
  ]
})

describe('App.vue', () => {
  it('renders the navigation', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    await router.push('/')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.text()).toContain('Web Video Translator')
    expect(wrapper.text()).toContain('Main App')
    expect(wrapper.text()).toContain('FFmpeg Test')
  })

  it('contains router-view for page content', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: ['router-view']
      }
    })
    
    await router.push('/')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('router-view-stub').exists()).toBe(true)
  })
})