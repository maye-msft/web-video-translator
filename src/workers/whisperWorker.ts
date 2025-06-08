// Web Worker for Whisper processing to avoid blocking the main thread
import {
  pipeline,
  AutomaticSpeechRecognitionPipeline,
  env,
} from '@xenova/transformers'

// Configure Transformer.js to use remote models (similar to whisper-web)
env.allowRemoteModels = true
env.allowLocalModels = false
env.useBrowserCache = true
env.remoteHost = 'https://huggingface.co'
env.remotePathTemplate = '{model}/resolve/main/'

// Singleton Pipeline Factory Pattern (inspired by whisper-web)
class WhisperPipelineFactory {
  private static instance: AutomaticSpeechRecognitionPipeline | null = null
  private static currentModel: string | null = null
  private static isLoading = false

  static async getInstance(
    modelName: string,
    progressCallback?: (data: any) => void
  ): Promise<AutomaticSpeechRecognitionPipeline> {
    // Return existing instance if same model
    if (this.instance && this.currentModel === modelName) {
      return this.instance
    }

    // Prevent concurrent loading
    if (this.isLoading) {
      throw new Error('Model is already being loaded')
    }

    this.isLoading = true

    try {
      // Dispose of previous instance
      if (this.instance) {
        this.dispose()
      }

      // Create new pipeline with proper configuration
      this.instance = await pipeline(
        'automatic-speech-recognition',
        modelName,
        {
          progress_callback: progressCallback,
          quantized: true,
          // Use no_attentions for medium+ models (memory optimization from whisper-web)
          revision:
            modelName.includes('medium') || modelName.includes('large')
              ? 'no_attentions'
              : 'main',
        }
      )

      this.currentModel = modelName
      return this.instance
    } finally {
      this.isLoading = false
    }
  }

  static isModelLoaded(modelName?: string): boolean {
    if (!modelName) {
      return this.instance !== null
    }
    return this.instance !== null && this.currentModel === modelName
  }

  static getCurrentModel(): string | null {
    return this.currentModel
  }

  static dispose(): void {
    if (this.instance) {
      // Clean up resources
      this.instance = null
      this.currentModel = null
    }
  }
}

// Worker state
let whisperPipeline: AutomaticSpeechRecognitionPipeline | null = null

// Message types
interface InitializeMessage {
  type: 'initialize'
  modelName: string
  requestId: string
}

interface TranscribeMessage {
  type: 'transcribe'
  audioData: Float32Array
  options: {
    language?: string
    task?: 'transcribe' | 'translate'
    return_timestamps?: boolean
    chunk_length_s?: number
  }
  requestId: string
}

interface CancelMessage {
  type: 'cancel'
  requestId: string
}

interface CleanupMessage {
  type: 'cleanup'
}

type WorkerMessage =
  | InitializeMessage
  | TranscribeMessage
  | CancelMessage
  | CleanupMessage

// Response types
interface ProgressResponse {
  type: 'progress'
  requestId: string
  progress: { progress: number; loaded: number; total: number }
}

interface ProgressItemsResponse {
  type: 'progress-items'
  requestId: string
  items: Array<{
    file: string
    name: string
    progress: number
    loaded: number
    total: number
    status: string
  }>
}

interface TranscriptionProgressResponse {
  type: 'transcription-progress'
  requestId: string
  progress: number
  chunkInfo?: {
    currentChunk: number
    totalChunks: number
    chunkProgress: number
    chunkText?: string
  }
}

interface StageChangeResponse {
  type: 'stage-change'
  requestId: string
  stage: string
}

interface InitializeSuccessResponse {
  type: 'initialize-success'
  requestId: string
  modelName: string
}

interface TranscribeSuccessResponse {
  type: 'transcribe-success'
  requestId: string
  result: {
    text: string
    chunks: Array<{
      text: string
      timestamp: [number, number]
    }>
  }
}

interface ErrorResponse {
  type: 'error'
  requestId: string
  error: string
}

interface CancelledResponse {
  type: 'cancelled'
  requestId: string
}

// Track active requests for cancellation
const activeRequests = new Set<string>()

// Track progress items by file (inspired by whisper-web)
const progressItems = new Map<
  string,
  {
    file: string
    name: string
    progress: number
    loaded: number
    total: number
    status: string
  }
>()

// Initialize Whisper model using singleton factory pattern
async function initializeWhisper(modelName: string, requestId: string) {
  try {
    // Check if model is already loaded
    if (WhisperPipelineFactory.isModelLoaded(modelName)) {
      whisperPipeline = await WhisperPipelineFactory.getInstance(modelName)

      if (activeRequests.has(requestId)) {
        self.postMessage({
          type: 'initialize-success',
          requestId,
          modelName,
        } as InitializeSuccessResponse)
      }
      return
    }

    // Clear progress items
    progressItems.clear()

    // Enhanced progress tracking with file-level granularity (whisper-web pattern)
    const progressCallback = (data: any) => {
      if (!activeRequests.has(requestId)) return

      if (data.status === 'progress') {
        // Update or create progress item
        const file = data.file || `model-${modelName}`
        const existing = progressItems.get(file) || {
          file,
          name: formatModelFileName(file),
          progress: 0,
          loaded: 0,
          total: 0,
          status: 'downloading',
        }

        const updated = {
          ...existing,
          progress: data.progress || 0,
          loaded: data.loaded || 0,
          total: data.total || 0,
          status: data.status || 'downloading',
        }

        progressItems.set(file, updated)

        // Send individual progress
        self.postMessage({
          type: 'progress',
          requestId,
          progress: {
            progress: data.progress || 0,
            loaded: data.loaded || 0,
            total: data.total || 0,
          },
        } as ProgressResponse)

        // Send progress items array (whisper-web style)
        self.postMessage({
          type: 'progress-items',
          requestId,
          items: Array.from(progressItems.values()),
        } as ProgressItemsResponse)
      }
    }

    // Initialize using factory pattern
    whisperPipeline = await WhisperPipelineFactory.getInstance(
      modelName,
      progressCallback
    )

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'initialize-success',
        requestId,
        modelName,
      } as InitializeSuccessResponse)
    }
  } catch (error) {
    whisperPipeline = null

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'error',
        requestId,
        error: `Failed to initialize Whisper model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      } as ErrorResponse)
    }
  }
}

// Helper function to format model file names
function formatModelFileName(file: string): string {
  const parts = file.split('/')
  const fileName = parts[parts.length - 1]
  return fileName.replace(/\.[^/.]+$/, '') // Remove extension
}

// Enhanced chunk-aware progress tracking
function createChunkAwareProgressTracker(
  requestId: string,
  audioDuration: number,
  chunkLengthS: number
) {
  let currentProgress = 0
  let progressInterval: NodeJS.Timeout | null = null
  let hasRealProgress = false
  let realProgressData: number | null = null
  let stage: 'loading' | 'processing' | 'finalizing' | 'complete' = 'loading'

  // Calculate expected chunks
  const totalChunks = Math.ceil(audioDuration / chunkLengthS)
  let currentChunk = 0
  let chunksProcessed = 0

  const sendProgress = (
    progress: number,
    source: 'hybrid' | 'callback' | 'chunk' = 'hybrid',
    chunkInfo?: {
      currentChunk?: number
      chunkProgress?: number
      chunkText?: string
    }
  ) => {
    currentProgress = Math.max(currentProgress, progress)

    // Update chunk tracking
    if (chunkInfo?.currentChunk !== undefined) {
      currentChunk = chunkInfo.currentChunk
      chunksProcessed = Math.max(chunksProcessed, currentChunk)
    }

    console.log(
      `Progress ${progress}% (${source}) - Stage: ${stage} - Chunk: ${currentChunk}/${totalChunks} - Request: ${requestId}`
    )

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'transcription-progress',
        requestId,
        progress: Math.round(currentProgress),
        chunkInfo: {
          currentChunk: currentChunk,
          totalChunks: totalChunks,
          chunkProgress: chunkInfo?.chunkProgress || 0,
          chunkText: chunkInfo?.chunkText,
        },
      } as TranscriptionProgressResponse)
    }
  }

  const start = () => {
    // Initial progress
    sendProgress(5)

    // Adaptive progress based on audio duration
    const baseInterval = Math.max(400, audioDuration * 50) // Slower for longer audio
    const maxProgress = 85 // Don't go beyond 85% without real callback

    progressInterval = setInterval(() => {
      if (!activeRequests.has(requestId)) {
        stop()
        return
      }

      // If we have real progress from callback, use hybrid approach
      if (hasRealProgress && realProgressData !== null) {
        const hybridProgress = Math.max(currentProgress + 2, realProgressData)
        sendProgress(Math.min(hybridProgress, maxProgress))
      } else {
        // Gradual increase with diminishing returns to avoid hanging
        const increment =
          stage === 'loading' ? 8 : stage === 'processing' ? 4 : 2
        const nextProgress = Math.min(currentProgress + increment, maxProgress)

        // Transition stages based on progress
        if (currentProgress >= 25 && stage === 'loading') {
          stage = 'processing'
        } else if (currentProgress >= 70 && stage === 'processing') {
          stage = 'finalizing'
        }

        sendProgress(nextProgress)
      }
    }, baseInterval)
  }

  const updateFromCallback = (callbackProgress: number, chunkData?: any) => {
    hasRealProgress = true
    realProgressData = Math.max(0, Math.min(100, callbackProgress))

    // Extract chunk information if available
    let chunkInfo: any = {}
    if (chunkData) {
      // Estimate current chunk based on progress
      const estimatedChunk = Math.floor((callbackProgress / 100) * totalChunks)
      chunkInfo = {
        currentChunk: estimatedChunk,
        chunkProgress:
          (callbackProgress % (100 / totalChunks)) * (totalChunks / 100) * 100,
        chunkText: chunkData.text || undefined,
      }
    }

    // Use callback data but ensure we don't go backwards
    if (realProgressData > currentProgress) {
      sendProgress(realProgressData, 'callback', chunkInfo)
    }
  }

  const updateChunkProgress = (
    chunkIndex: number,
    chunkProgress: number,
    chunkText?: string
  ) => {
    const overallProgress = Math.min(95, (chunkIndex / totalChunks) * 85 + 10) // 10-95% range
    const chunkInfo = {
      currentChunk: chunkIndex + 1, // 1-based for display
      chunkProgress: chunkProgress,
      chunkText: chunkText,
    }
    sendProgress(overallProgress, 'chunk', chunkInfo)
  }

  const setStage = (newStage: typeof stage, progress?: number) => {
    stage = newStage

    // Send stage change notification (inspired by whisper-web)
    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'stage-change',
        requestId,
        stage: newStage,
      } as StageChangeResponse)
    }

    if (progress !== undefined) {
      sendProgress(progress)
    }
  }

  const stop = () => {
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }

  const complete = () => {
    stop()
    stage = 'complete'
    sendProgress(100)
  }

  return {
    start,
    updateFromCallback,
    updateChunkProgress,
    setStage,
    stop,
    complete,
    getTotalChunks: () => totalChunks,
  }
}

// Transcribe audio with hybrid progress tracking
async function transcribeAudio(
  audioData: Float32Array,
  options: any,
  requestId: string
) {
  if (!whisperPipeline) {
    self.postMessage({
      type: 'error',
      requestId,
      error: 'Whisper model is not initialized',
    } as ErrorResponse)
    return
  }

  const audioDuration = audioData.length / 16000
  const {
    language = 'english',
    task = 'transcribe',
    return_timestamps = true,
    chunk_length_s = 30,
  } = options

  // Calculate optimal chunk length
  const optimalChunkLength = Math.min(
    chunk_length_s,
    audioDuration > 60 ? 20 : 30 // Smaller chunks for longer audio
  )

  const progressTracker = createChunkAwareProgressTracker(
    requestId,
    audioDuration,
    optimalChunkLength
  )

  try {
    console.log(
      `Starting transcription - Duration: ${audioDuration.toFixed(2)}s - Chunks: ${progressTracker.getTotalChunks()} - Request: ${requestId}`
    )

    // Start chunk-aware progress tracking
    progressTracker.start()

    // If the pipeline does not emit chunk progress, manually chunk and process
    const sampleRate = 16000
    const chunkSize = Math.floor(optimalChunkLength * sampleRate)
    const totalChunks = Math.ceil(audioData.length / chunkSize)
    // Helper to normalize pipeline output
    function normalizeResult(result: any) {
      if (Array.isArray(result)) {
        return result[0]
      }
      return result
    }
    let fullText = ''
    const mergedChunks: Array<{ text: string; timestamp: [number, number] }> =
      []
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min((i + 1) * chunkSize, audioData.length)
      const chunk = audioData.slice(start, end)
      // Process chunk
      let chunkResult: any
      try {
        chunkResult = await whisperPipeline(chunk, {
          language,
          task,
          return_timestamps,
        })
        chunkResult = normalizeResult(chunkResult)
      } catch (err) {
        console.error('Chunk transcription failed:', err)
        continue
      }
      fullText +=
        (chunkResult && chunkResult.text ? chunkResult.text : '') + ' '
      // Collect chunk for SRT
      if (
        chunkResult &&
        chunkResult.chunks &&
        Array.isArray(chunkResult.chunks)
      ) {
        // Adjust timestamps to be relative to the full audio
        const chunkStartTime = i * optimalChunkLength
        for (const c of chunkResult.chunks) {
          // Shift timestamps by chunkStartTime
          const shifted = {
            text: c.text,
            timestamp: [
              (c.timestamp?.[0] ?? 0) + chunkStartTime,
              (c.timestamp?.[1] ?? 0) + chunkStartTime,
            ] as [number, number],
          }
          mergedChunks.push(shifted)
        }
      } else if (chunkResult && chunkResult.text) {
        // Fallback: treat as one chunk
        mergedChunks.push({
          text: chunkResult.text,
          timestamp: [
            i * optimalChunkLength,
            Math.min((i + 1) * optimalChunkLength, audioDuration),
          ],
        })
      }
      // Emit chunk progress
      progressTracker.updateChunkProgress(
        i,
        100,
        chunkResult && chunkResult.text ? chunkResult.text : ''
      )
    }
    const result = {
      text: fullText.trim(),
      chunks: mergedChunks,
    }
    if (!activeRequests.has(requestId)) {
      progressTracker.stop()
      return // Request was cancelled
    }
    // Process results
    progressTracker.setStage('finalizing', 90)
    // Complete progress tracking
    progressTracker.complete()
    self.postMessage({
      type: 'transcribe-success',
      requestId,
      result,
    } as TranscribeSuccessResponse)

    console.log(`Transcription completed successfully - Request: ${requestId}`)
  } catch (error) {
    progressTracker.stop()

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'error',
        requestId,
        error: `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      } as ErrorResponse)
    }
  } finally {
    // Always clean up the request from activeRequests at the very end
    activeRequests.delete(requestId)
    console.log(
      'Cleaned up request from activeRequests:',
      requestId,
      'Remaining:',
      Array.from(activeRequests)
    )
  }
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data

  if (type === 'initialize') {
    const { modelName, requestId } = event.data as InitializeMessage
    activeRequests.add(requestId)
    await initializeWhisper(modelName, requestId)
    activeRequests.delete(requestId)
  } else if (type === 'transcribe') {
    const { audioData, options, requestId } = event.data as TranscribeMessage
    activeRequests.add(requestId)
    console.log(
      'Added request to activeRequests:',
      requestId,
      'Current set:',
      Array.from(activeRequests)
    )
    // Start transcription - don't use finally() which might execute too early
    transcribeAudio(audioData, options, requestId)
  } else if (type === 'cancel') {
    const { requestId } = event.data as CancelMessage
    activeRequests.delete(requestId)
    self.postMessage({
      type: 'cancelled',
      requestId,
    } as CancelledResponse)
  } else if (type === 'cleanup') {
    activeRequests.clear()
    progressItems.clear()
    WhisperPipelineFactory.dispose()
    whisperPipeline = null
  }
}

// Export empty object to make this a module
export {}
