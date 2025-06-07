import { ref, reactive, computed, watch, readonly } from 'vue'
import type { SubtitleSegment } from '@/utils/translation'
import type { SubtitleStyle } from '@/utils/ffmpeg'

// Workflow step definitions
export type WorkflowStep = 1 | 2 | 3 | 4

export interface WorkflowArtifacts {
  // Step 1 artifacts
  videoFile: File | null
  extractedAudio: Uint8Array | null
  audioFormat: 'wav' | 'mp3'
  
  // Step 2 artifacts  
  audioFile: File | null
  transcriptionSRT: string
  transcriptionSegments: SubtitleSegment[]
  selectedWhisperModel: string
  
  // Step 3 artifacts
  originalSRT: string
  translatedSRT: string
  sourceLanguage: string
  targetLanguage: string
  translationSegments: SubtitleSegment[]
  
  // Step 4 artifacts
  subtitleStyle: SubtitleStyle | null
  outputFormat: 'mp4' | 'webm'
  finalVideo: Uint8Array | null
}

export interface WorkflowState {
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
  artifacts: WorkflowArtifacts
  isProcessing: boolean
  lastSaved: Date | null
}

// Default artifacts state
const defaultArtifacts: WorkflowArtifacts = {
  videoFile: null,
  extractedAudio: null,
  audioFormat: 'wav',
  audioFile: null,
  transcriptionSRT: '',
  transcriptionSegments: [],
  selectedWhisperModel: '',
  originalSRT: '',
  translatedSRT: '',
  sourceLanguage: 'en',
  targetLanguage: 'es',
  translationSegments: [],
  subtitleStyle: null,
  outputFormat: 'mp4',
  finalVideo: null
}

// Global workflow state
const workflowState = reactive<WorkflowState>({
  currentStep: 1,
  completedSteps: [],
  artifacts: { ...defaultArtifacts },
  isProcessing: false,
  lastSaved: null
})

// Storage key for persistence
const STORAGE_KEY = 'video-translator-workflow'

export function useWorkflowState() {
  
  // Computed properties
  const canAccessStep = computed(() => (step: WorkflowStep): boolean => {
    switch (step) {
      case 1:
        return true // Always can access step 1
      case 2:
        return workflowState.completedSteps.includes(1) || 
               workflowState.artifacts.videoFile !== null ||
               workflowState.artifacts.audioFile !== null
      case 3:
        return workflowState.completedSteps.includes(2) || 
               workflowState.artifacts.transcriptionSRT !== ''
      case 4:
        return workflowState.completedSteps.includes(3) || 
               workflowState.artifacts.translatedSRT !== ''
      default:
        return false
    }
  })

  const stepProgress = computed(() => {
    const total = 4
    const completed = workflowState.completedSteps.length
    return Math.round((completed / total) * 100)
  })

  const nextStep = computed((): WorkflowStep | null => {
    const current = workflowState.currentStep
    if (current < 4 && canAccessStep.value(current + 1 as WorkflowStep)) {
      return current + 1 as WorkflowStep
    }
    return null
  })

  const canProceedToNext = computed(() => {
    const step = workflowState.currentStep
    switch (step) {
      case 1:
        return workflowState.artifacts.videoFile !== null && 
               workflowState.artifacts.extractedAudio !== null
      case 2:
        return workflowState.artifacts.transcriptionSRT !== ''
      case 3:
        return workflowState.artifacts.translatedSRT !== ''
      case 4:
        return true // Final step
      default:
        return false
    }
  })

  // Actions
  function setCurrentStep(step: WorkflowStep) {
    if (canAccessStep.value(step)) {
      workflowState.currentStep = step
      saveState()
    }
  }

  function completeStep(step: WorkflowStep) {
    if (!workflowState.completedSteps.includes(step)) {
      workflowState.completedSteps.push(step)
      workflowState.completedSteps.sort()
      saveState()
    }
  }

  function updateArtifacts(updates: Partial<WorkflowArtifacts>) {
    Object.assign(workflowState.artifacts, updates)
    saveState()
  }

  function setProcessing(processing: boolean) {
    workflowState.isProcessing = processing
  }

  function proceedToNext() {
    const next = nextStep.value
    if (next && canProceedToNext.value) {
      completeStep(workflowState.currentStep)
      setCurrentStep(next)
      return next
    }
    return null
  }

  function resetWorkflow() {
    workflowState.currentStep = 1
    workflowState.completedSteps = []
    workflowState.artifacts = { ...defaultArtifacts }
    workflowState.isProcessing = false
    workflowState.lastSaved = null
    saveState()
  }

  function jumpToStep(step: WorkflowStep) {
    if (canAccessStep.value(step)) {
      setCurrentStep(step)
      return true
    }
    return false
  }

  // Persistence
  function saveState() {
    try {
      const stateToSave = {
        currentStep: workflowState.currentStep,
        completedSteps: workflowState.completedSteps,
        artifacts: {
          ...workflowState.artifacts,
          // Don't persist large binary data
          videoFile: null,
          extractedAudio: null,
          audioFile: null,
          finalVideo: null
        },
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
      workflowState.lastSaved = new Date()
    } catch (error) {
      console.warn('Failed to save workflow state:', error)
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const state = JSON.parse(saved)
        workflowState.currentStep = state.currentStep || 1
        workflowState.completedSteps = state.completedSteps || []
        
        // Only restore non-binary artifacts
        Object.assign(workflowState.artifacts, {
          ...defaultArtifacts,
          transcriptionSRT: state.artifacts?.transcriptionSRT || '',
          transcriptionSegments: state.artifacts?.transcriptionSegments || [],
          selectedWhisperModel: state.artifacts?.selectedWhisperModel || '',
          originalSRT: state.artifacts?.originalSRT || '',
          translatedSRT: state.artifacts?.translatedSRT || '',
          sourceLanguage: state.artifacts?.sourceLanguage || 'en',
          targetLanguage: state.artifacts?.targetLanguage || 'es',
          translationSegments: state.artifacts?.translationSegments || [],
          subtitleStyle: state.artifacts?.subtitleStyle || null,
          outputFormat: state.artifacts?.outputFormat || 'mp4'
        })
        
        workflowState.lastSaved = state.lastSaved ? new Date(state.lastSaved) : null
        console.log('Workflow state loaded from storage')
      }
    } catch (error) {
      console.warn('Failed to load workflow state:', error)
      resetWorkflow()
    }
  }

  function clearSavedState() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear saved state:', error)
    }
  }

  // Initialize state from storage
  loadState()

  // Auto-save on changes
  watch(
    () => ({ ...workflowState }),
    () => {
      if (workflowState.lastSaved) {
        saveState()
      }
    },
    { deep: true }
  )

  return {
    // State
    workflowState: readonly(workflowState),
    
    // Computed
    canAccessStep,
    stepProgress,
    nextStep,
    canProceedToNext,
    
    // Actions
    setCurrentStep,
    completeStep,
    updateArtifacts,
    setProcessing,
    proceedToNext,
    resetWorkflow,
    jumpToStep,
    
    // Persistence
    saveState,
    loadState,
    clearSavedState
  }
}

// Export for direct access if needed
export { workflowState }