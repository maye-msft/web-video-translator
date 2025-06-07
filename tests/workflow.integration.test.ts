import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWorkflowState } from '../src/composables/useWorkflowState'

// Mock external dependencies
vi.mock('../src/utils/ffmpeg', () => ({
  initializeFFmpeg: vi.fn().mockResolvedValue(undefined),
  isFFmpegLoaded: vi.fn().mockReturnValue(true),
  extractAudio: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  processVideoWithSubtitles: vi.fn().mockResolvedValue({
    videoData: new Uint8Array([4, 5, 6]),
    metadata: { duration: 30, size: 1000 },
  }),
  downloadFile: vi.fn(),
  DEFAULT_SUBTITLE_STYLE: {
    fontFamily: 'Arial',
    fontSize: 24,
    fontColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    position: 'bottom',
  },
}))

vi.mock('../src/utils/whisper', () => ({
  WHISPER_MODELS: [
    { id: 'tiny', name: 'Tiny', size: '39MB' },
    { id: 'base', name: 'Base', size: '74MB' },
  ],
  transcribeAudio: vi
    .fn()
    .mockResolvedValue([{ text: 'Hello world', start: 0, end: 2 }]),
  generateSRT: vi
    .fn()
    .mockReturnValue('1\n00:00:00,000 --> 00:00:02,000\nHello world\n'),
  downloadSRT: vi.fn(),
  isWhisperLoaded: vi.fn().mockReturnValue(true),
  getCurrentModelName: vi.fn().mockReturnValue('tiny'),
}))

vi.mock('../src/utils/translation', () => ({
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
  ],
  translateSubtitles: vi
    .fn()
    .mockResolvedValue([{ text: 'Hola mundo', start: 0, end: 2 }]),
  downloadSRT: vi.fn(),
  parseSRT: vi
    .fn()
    .mockReturnValue([{ text: 'Hello world', start: 0, end: 2 }]),
  formatFileSize: vi.fn().mockReturnValue('1.2 MB'),
}))

describe('Workflow State Management Integration Tests', () => {
  beforeEach(() => {
    // Reset workflow state
    const { resetWorkflow } = useWorkflowState()
    resetWorkflow()
  })

  describe('Complete Workflow Integration', () => {
    it('should maintain workflow state across all steps', async () => {
      const { workflowState, updateArtifacts, completeStep } =
        useWorkflowState()

      // Step 1: Video upload and audio extraction
      const mockVideo = new File(['video content'], 'test.mp4', {
        type: 'video/mp4',
      })
      const mockAudio = new Uint8Array([1, 2, 3])

      updateArtifacts({
        videoFile: mockVideo,
        extractedAudio: mockAudio,
        audioFormat: 'wav',
      })
      completeStep(1)

      expect(workflowState.artifacts.videoFile).toBe(mockVideo)
      expect(workflowState.artifacts.extractedAudio).toBe(mockAudio)
      expect(workflowState.completedSteps).toContain(1)

      // Step 2: Transcription
      const mockSRT = '1\n00:00:00,000 --> 00:00:02,000\nHello world\n'
      const mockSegments = [{ text: 'Hello world', start: 0, end: 2 }]

      updateArtifacts({
        transcriptionSRT: mockSRT,
        transcriptionSegments: mockSegments,
        originalSRT: mockSRT,
      })
      completeStep(2)

      expect(workflowState.artifacts.transcriptionSRT).toBe(mockSRT)
      expect(workflowState.completedSteps).toContain(2)

      // Step 3: Translation
      const mockTranslatedSRT = '1\n00:00:00,000 --> 00:00:02,000\nHola mundo\n'
      const mockTranslatedSegments = [{ text: 'Hola mundo', start: 0, end: 2 }]

      updateArtifacts({
        translatedSRT: mockTranslatedSRT,
        translationSegments: mockTranslatedSegments,
        targetLanguage: 'es',
      })
      completeStep(3)

      expect(workflowState.artifacts.translatedSRT).toBe(mockTranslatedSRT)
      expect(workflowState.completedSteps).toContain(3)

      // Step 4: Final video generation
      const mockFinalVideo = new Uint8Array([4, 5, 6])

      updateArtifacts({
        finalVideo: mockFinalVideo,
      })
      completeStep(4)

      expect(workflowState.artifacts.finalVideo).toBe(mockFinalVideo)
      expect(workflowState.completedSteps).toContain(4)
      expect(workflowState.completedSteps.length).toBe(4)
    })

    it('should validate step access permissions correctly', () => {
      const { canAccessStep, updateArtifacts, completeStep } =
        useWorkflowState()

      // Initially, only step 1 should be accessible
      expect(canAccessStep.value(1)).toBe(true)
      expect(canAccessStep.value(2)).toBe(false)
      expect(canAccessStep.value(3)).toBe(false)
      expect(canAccessStep.value(4)).toBe(false)

      // After completing step 1, step 2 should be accessible
      updateArtifacts({
        videoFile: new File(['video'], 'test.mp4'),
        extractedAudio: new Uint8Array([1, 2, 3]),
      })
      completeStep(1)

      expect(canAccessStep.value(2)).toBe(true)
      expect(canAccessStep.value(3)).toBe(false)
      expect(canAccessStep.value(4)).toBe(false)

      // After completing step 2, step 3 should be accessible
      updateArtifacts({
        transcriptionSRT: 'test srt content',
      })
      completeStep(2)

      expect(canAccessStep.value(3)).toBe(true)
      expect(canAccessStep.value(4)).toBe(false)

      // After completing step 3, step 4 should be accessible
      updateArtifacts({
        translatedSRT: 'translated srt content',
      })
      completeStep(3)

      expect(canAccessStep.value(4)).toBe(true)
    })

    it('should handle workflow progression correctly', () => {
      const { workflowState, canProceedToNext, proceedToNext, nextStep } =
        useWorkflowState()

      // Initially can't proceed
      expect(canProceedToNext.value).toBe(false)
      expect(nextStep.value).toBe(null)

      // Set up step 1 completion conditions
      const { updateArtifacts } = useWorkflowState()
      updateArtifacts({
        videoFile: new File(['test'], 'test.mp4'),
        extractedAudio: new Uint8Array([1, 2, 3]),
      })

      expect(canProceedToNext.value).toBe(true)
      expect(nextStep.value).toBe(2)

      // Proceed to next step
      const result = proceedToNext()
      expect(result).toBe(2)
      expect(workflowState.currentStep).toBe(2)
      expect(workflowState.completedSteps).toContain(1)
    })

    it('should reset workflow state correctly', () => {
      const { workflowState, updateArtifacts, completeStep, resetWorkflow } =
        useWorkflowState()

      // Set up some state
      updateArtifacts({
        videoFile: new File(['test'], 'test.mp4'),
        transcriptionSRT: 'test content',
      })
      completeStep(1)
      completeStep(2)

      expect(workflowState.completedSteps.length).toBe(2)
      expect(workflowState.artifacts.videoFile).toBeTruthy()

      // Reset workflow
      resetWorkflow()

      expect(workflowState.currentStep).toBe(1)
      expect(workflowState.completedSteps.length).toBe(0)
      expect(workflowState.artifacts.videoFile).toBe(null)
      expect(workflowState.artifacts.transcriptionSRT).toBe('')
    })

    it('should calculate step progress correctly', () => {
      const { stepProgress, completeStep } = useWorkflowState()

      expect(stepProgress.value).toBe(0)

      completeStep(1)
      expect(stepProgress.value).toBe(25)

      completeStep(2)
      expect(stepProgress.value).toBe(50)

      completeStep(3)
      expect(stepProgress.value).toBe(75)

      completeStep(4)
      expect(stepProgress.value).toBe(100)
    })
  })

  describe('Workflow State Persistence', () => {
    it('should handle localStorage operations safely', () => {
      const { saveState, loadState } = useWorkflowState()

      // Mock localStorage
      const mockStorage: Record<string, string> = {}
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: (key: string) => mockStorage[key] || null,
          setItem: (key: string, value: string) => {
            mockStorage[key] = value
          },
          removeItem: (key: string) => {
            delete mockStorage[key]
          },
        },
      })

      // Test save and load
      expect(() => saveState()).not.toThrow()
      expect(() => loadState()).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle jump to step validation', () => {
      const { jumpToStep, canAccessStep } = useWorkflowState()

      // Should not be able to jump to inaccessible step
      expect(jumpToStep(3)).toBe(false)
      expect(canAccessStep.value(3)).toBe(false)

      // Should be able to jump to accessible step
      expect(jumpToStep(1)).toBe(true)
    })

    it('should handle processing state correctly', () => {
      const { workflowState, setProcessing } = useWorkflowState()

      expect(workflowState.isProcessing).toBe(false)

      setProcessing(true)
      expect(workflowState.isProcessing).toBe(true)

      setProcessing(false)
      expect(workflowState.isProcessing).toBe(false)
    })
  })
})
