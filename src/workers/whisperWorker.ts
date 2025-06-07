// Web Worker for Whisper processing to avoid blocking the main thread
import {
  pipeline,
  AutomaticSpeechRecognitionPipeline,
  env,
} from '@xenova/transformers'

// Configure Transformer.js to use remote models
env.allowRemoteModels = true
env.allowLocalModels = false
env.useBrowserCache = true
env.remoteHost = 'https://huggingface.co'
env.remotePathTemplate = '{model}/resolve/main/'

// Worker state
let whisperPipeline: AutomaticSpeechRecognitionPipeline | null = null
let currentModelName: string | null = null

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

interface TranscriptionProgressResponse {
  type: 'transcription-progress'
  requestId: string
  progress: number
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

// Initialize Whisper model
async function initializeWhisper(modelName: string, requestId: string) {
  try {
    if (whisperPipeline && currentModelName === modelName) {
      self.postMessage({
        type: 'initialize-success',
        requestId,
        modelName,
      } as InitializeSuccessResponse)
      return
    }

    // Clear existing pipeline if switching models
    if (whisperPipeline && currentModelName !== modelName) {
      whisperPipeline = null
      currentModelName = null
    }

    // Set up progress tracking
    const progressCallback = (data: any) => {
      if (data.status === 'progress' && activeRequests.has(requestId)) {
        self.postMessage({
          type: 'progress',
          requestId,
          progress: {
            progress: data.progress || 0,
            loaded: data.loaded || 0,
            total: data.total || 0,
          },
        } as ProgressResponse)
      }
    }

    // Initialize the pipeline with progress tracking
    whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      modelName,
      {
        progress_callback: progressCallback,
        quantized: true,
      }
    )

    currentModelName = modelName

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'initialize-success',
        requestId,
        modelName,
      } as InitializeSuccessResponse)
    }
  } catch (error) {
    whisperPipeline = null
    currentModelName = null

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'error',
        requestId,
        error: `Failed to initialize Whisper model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      } as ErrorResponse)
    }
  }
}

// Transcribe audio
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

  let progressInterval: NodeJS.Timeout | null = null

  try {
    const {
      language = 'english',
      task = 'transcribe',
      return_timestamps = true,
      chunk_length_s = 30,
    } = options

    // Progress simulation with guaranteed increments
    let progress = 5
    const audioDurationEstimate = audioData.length / 16000

    // Send initial progress
    console.log('Worker sending initial progress:', progress)
    console.log('Active requests:', Array.from(activeRequests))
    self.postMessage({
      type: 'transcription-progress',
      requestId,
      progress,
    } as TranscriptionProgressResponse)

    // Use fixed increment that guarantees visible progress
    const progressIncrement = 2 // 2% every 250ms = steady progress

    console.log('Progress setup:', {
      audioDuration: audioDurationEstimate,
      increment: progressIncrement,
      intervalMs: 250,
    })

    // Create progress interval that increments gradually
    progressInterval = setInterval(() => {
      console.log(
        'Progress interval tick - activeRequests:',
        Array.from(activeRequests),
        'looking for:',
        requestId,
        'has request:',
        activeRequests.has(requestId),
        'current progress:',
        progress
      )
      if (!activeRequests.has(requestId)) {
        console.log(
          'Request cancelled or not found, stopping progress interval for:',
          requestId
        )
        if (progressInterval) clearInterval(progressInterval)
        return
      }

      progress += progressIncrement
      progress = Math.min(progress, 85) // Leave room for final steps

      console.log(
        'Worker sending progress:',
        Math.round(progress),
        'for request:',
        requestId
      )
      self.postMessage({
        type: 'transcription-progress',
        requestId,
        progress: Math.round(progress),
      } as TranscriptionProgressResponse)
    }, 250) // More frequent updates (every 250ms)

    // Perform transcription
    let result: any
    try {
      result = await whisperPipeline(audioData, {
        language,
        task,
        return_timestamps,
        chunk_length_s,
        force_full_sequences: false,
      })
    } catch (pipelineError) {
      // Try alternative approach
      if (typeof whisperPipeline === 'object' && whisperPipeline !== null) {
        if (
          'transcribe' in whisperPipeline &&
          typeof (whisperPipeline as any).transcribe === 'function'
        ) {
          result = await (whisperPipeline as any).transcribe(audioData, {
            language,
            task,
            return_timestamps,
            chunk_length_s,
          })
        } else {
          throw pipelineError
        }
      } else {
        throw pipelineError
      }
    }

    // Clear the progress interval before processing
    if (progressInterval) {
      clearInterval(progressInterval)
    }

    if (!activeRequests.has(requestId)) {
      return // Request was cancelled
    }

    // Update progress to show we're processing results
    console.log('Worker sending progress: 90 (processing results)')
    self.postMessage({
      type: 'transcription-progress',
      requestId,
      progress: 90,
    } as TranscriptionProgressResponse)

    // Process results
    const resultData = result as any
    let processedResult: any

    if (resultData.chunks && Array.isArray(resultData.chunks)) {
      processedResult = {
        text: resultData.text || '',
        chunks: resultData.chunks.map((chunk: any) => ({
          text: chunk.text || '',
          timestamp: chunk.timestamp || [0, 0],
        })),
      }
    } else {
      const textResult = resultData.text || resultData || ''
      processedResult = {
        text: textResult,
        chunks: [
          {
            text: textResult,
            timestamp: [0, audioData.length / 16000],
          },
        ],
      }
    }

    // Final progress update
    console.log('Worker sending progress: 100 (complete)')
    self.postMessage({
      type: 'transcription-progress',
      requestId,
      progress: 100,
    } as TranscriptionProgressResponse)

    self.postMessage({
      type: 'transcribe-success',
      requestId,
      result: processedResult,
    } as TranscribeSuccessResponse)
  } catch (error) {
    // Clean up progress interval on error
    if (progressInterval) {
      clearInterval(progressInterval)
    }

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
    whisperPipeline = null
    currentModelName = null
  }
}

// Export empty object to make this a module
export {}
