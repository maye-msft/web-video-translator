import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'

// Create a minimal component for testing
const MockStep1 = { template: '<div>Step 1: Upload Video</div>' }

// Create mock router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/step-1' },
    { path: '/step-1', component: MockStep1, name: 'Step1' },
    {
      path: '/ffmpeg-test',
      component: { template: '<div>FFmpeg Test</div>' },
      name: 'FFmpegTest',
    },
  ],
})

describe('App.vue', () => {
  it('renders the navigation', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          WorkflowNavigation: true,
        },
      },
    })

    await router.push('/ffmpeg-test')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.text()).toContain('Web Video Translator')
    expect(wrapper.text()).toContain('Development Test Page')
  })

  it('contains router-view for page content', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: ['router-view'],
      },
    })

    await router.push('/')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('router-view-stub').exists()).toBe(true)
  })
})
