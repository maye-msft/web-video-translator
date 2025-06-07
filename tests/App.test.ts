import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'

describe('App.vue', () => {
  it('renders the main application', () => {
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toBe('Web Video Translator')
  })

  it('contains the main sections', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Upload Video')
    expect(wrapper.text()).toContain('Subtitle Management')
    expect(wrapper.text()).toContain('Subtitle Editor')
    expect(wrapper.text()).toContain('Generate Video with Subtitles')
  })
})