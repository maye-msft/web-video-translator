import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoUpload from '../src/components/VideoUpload.vue'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

describe('VideoUpload.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(VideoUpload)
  })

  it('renders the upload component correctly', () => {
    expect(wrapper.find('h2').text()).toBe('1. Upload Video')
    expect(wrapper.find('p').text()).toContain('Drop your video file here')
  })

  it('shows drag over state when dragging files', async () => {
    const dropZone = wrapper.find('[data-testid="drop-zone"]')
    
    await dropZone.trigger('dragenter')
    expect(wrapper.vm.isDragOver).toBe(true)
    
    await dropZone.trigger('dragleave')
    expect(wrapper.vm.isDragOver).toBe(false)
  })

  it('validates file type correctly', () => {
    const validFile = new File([''], 'test.mp4', { type: 'video/mp4' })
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })
    
    // Access the component's validation method
    const validateFile = wrapper.vm.validateFile
    
    expect(validateFile(validFile)).toBeNull()
    expect(validateFile(invalidFile)).toContain('Unsupported file format')
  })

  it('validates file size correctly', () => {
    // Create a mock file with large size without actually creating the content
    const largeFile = new File(['test'], 'large.mp4', { 
      type: 'video/mp4'
    })
    
    // Mock the size property
    Object.defineProperty(largeFile, 'size', {
      value: 600 * 1024 * 1024, // 600MB
      writable: false
    })
    
    const validateFile = wrapper.vm.validateFile
    expect(validateFile(largeFile)).toContain('File size too large')
  })

  it('emits fileSelected event when valid file is processed', async () => {
    const validFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    
    await wrapper.vm.processFile(validFile)
    
    expect(wrapper.emitted('fileSelected')).toBeTruthy()
    expect(wrapper.emitted('fileSelected')[0]).toEqual([validFile])
  })

  it('emits error event when invalid file is processed', async () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    await wrapper.vm.processFile(invalidFile)
    
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')[0][0]).toContain('Unsupported file format')
  })

  it('shows selected file information', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    
    await wrapper.vm.processFile(file)
    
    expect(wrapper.vm.selectedFile).toBe(file)
    expect(wrapper.text()).toContain('test.mp4')
  })

  it('clears file when remove button is clicked', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    
    await wrapper.vm.processFile(file)
    expect(wrapper.vm.selectedFile).toBe(file)
    
    wrapper.vm.clearFile()
    expect(wrapper.vm.selectedFile).toBeNull()
    expect(wrapper.emitted('fileCleared')).toBeTruthy()
  })

  it('formats file size correctly', () => {
    const formatFileSize = wrapper.vm.formatFileSize
    
    expect(formatFileSize(0)).toBe('0 Bytes')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })
})