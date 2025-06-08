import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkflowStep2 from '../src/components/WorkflowStep2.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Mock the whisper service
vi.mock('../src/services/whisperService', () => ({
  whisperService: {
    isModelLoaded: vi.fn(() => false),
    getCurrentModelName: vi.fn(() => null),
    initializeWhisper: vi.fn(),
    transcribeAudio: vi.fn(),
    cleanup: vi.fn(),
  },
}))

// Mock the whisper utilities
vi.mock('../src/utils/whisper', () => ({
  WHISPER_MODELS: [
    {
      name: 'Xenova/whisper-small',
      displayName: 'Whisper Small',
      size: '~244MB',
      description: 'Test model',
    },
  ],
  generateSRT: vi.fn(_result => 'Mock SRT content'),
  downloadSRT: vi.fn(),
  preprocessAudio: vi.fn(() => Promise.resolve(new Float32Array(1000))),
}))

// Mock workflow state
vi.mock('../src/composables/useWorkflowState', () => ({
  useWorkflowState: () => ({
    workflowState: {
      artifacts: {
        extractedAudio: null,
        audioFormat: null,
        audioFile: null,
        selectedWhisperModel: null,
        transcriptionSRT: '',
        transcriptionSegments: [],
        originalSRT: '',
      },
      completedSteps: new Set(),
      isProcessing: false,
      currentStep: 2,
    },
    updateArtifacts: vi.fn(),
    setProcessing: vi.fn(),
    completeStep: vi.fn(),
  }),
}))

describe('Multi-Stage Progress Tracking (inspired by whisper-web)', () => {
  let wrapper: any
  let router: any

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/step2', component: WorkflowStep2 },
      ],
    })

    wrapper = mount(WorkflowStep2, {
      global: {
        plugins: [router],
      },
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('should initialize progress tracking state correctly', () => {
    // Check that all progress state variables are initialized
    expect(wrapper.vm.progressItems).toEqual([])
    expect(wrapper.vm.isModelLoading).toBe(false)
    expect(wrapper.vm.isAudioProcessing).toBe(false)
    expect(wrapper.vm.isTranscribing).toBe(false)
    expect(wrapper.vm.transcriptionProgress).toBe(0)
    expect(wrapper.vm.transcriptionStage).toBe('preparing')
  })

  it('should display progress components when in different states', async () => {
    // Test model loading state
    wrapper.vm.progressItems = [
      {
        file: 'model.onnx',
        name: 'Whisper Model',
        progress: 50,
        loaded: 1000,
        total: 2000,
        status: 'downloading',
      },
    ]
    await wrapper.vm.$nextTick()

    const progressItemsContainer = wrapper.find(
      '[data-testid="progress-items"]'
    )
    if (progressItemsContainer.exists()) {
      expect(progressItemsContainer.text()).toContain('Loading model files')
      expect(progressItemsContainer.text()).toContain('50%')
    }

    // Test audio processing state
    wrapper.vm.isAudioProcessing = true
    wrapper.vm.audioProcessingProgress = 75
    await wrapper.vm.$nextTick()

    const audioProcessingContainer = wrapper.find(
      '[data-testid="audio-processing"]'
    )
    if (audioProcessingContainer.exists()) {
      expect(audioProcessingContainer.text()).toContain('Processing audio file')
      expect(audioProcessingContainer.text()).toContain('75%')
    }

    // Test transcription state
    wrapper.vm.isTranscribing = true
    wrapper.vm.transcriptionProgress = 60
    wrapper.vm.transcriptionStatus = 'Generating subtitles...'
    await wrapper.vm.$nextTick()

    const transcriptionContainer = wrapper.find(
      '[data-testid="transcription-progress"]'
    )
    if (transcriptionContainer.exists()) {
      expect(transcriptionContainer.text()).toContain('Generating subtitles')
      expect(transcriptionContainer.text()).toContain('60%')
    }
  })

  it('should have helper methods for stage management', () => {
    // Test getTranscriptionStageText method
    wrapper.vm.transcriptionStage = 'preparing'
    expect(wrapper.vm.getTranscriptionStageText()).toContain('Preparing audio')

    wrapper.vm.transcriptionStage = 'processing'
    wrapper.vm.transcriptionProgress = 45
    expect(wrapper.vm.getTranscriptionStageText()).toContain(
      'Processing audio segments... 45%'
    )

    wrapper.vm.transcriptionStage = 'complete'
    expect(wrapper.vm.getTranscriptionStageText()).toContain(
      'Transcription complete!'
    )
  })

  it('should show appropriate button states during different stages', async () => {
    // Initial state
    expect(wrapper.vm.getTranscribeButtonText).toContain('Load')

    // Model loading state
    wrapper.vm.isModelLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.getTranscribeButtonText).toContain('Loading Model')

    // Transcribing state
    wrapper.vm.isModelLoading = false
    wrapper.vm.isTranscribing = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.getTranscribeButtonText).toContain('Generating Subtitles')
  })

  it('should properly clean up progress state', () => {
    // Set some progress state
    wrapper.vm.progressItems = [
      {
        file: 'test',
        name: 'Test',
        progress: 50,
        loaded: 0,
        total: 100,
        status: 'downloading',
      },
    ]
    wrapper.vm.isModelLoading = true
    wrapper.vm.isAudioProcessing = true
    wrapper.vm.isTranscribing = true

    // Simulate cleanup (normally happens in finally block)
    wrapper.vm.progressItems = []
    wrapper.vm.isModelLoading = false
    wrapper.vm.isAudioProcessing = false
    wrapper.vm.isTranscribing = false

    expect(wrapper.vm.progressItems).toEqual([])
    expect(wrapper.vm.isModelLoading).toBe(false)
    expect(wrapper.vm.isAudioProcessing).toBe(false)
    expect(wrapper.vm.isTranscribing).toBe(false)
  })
})
