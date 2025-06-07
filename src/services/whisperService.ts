// Service to manage Whisper Web Worker
import {
  type TranscriptionResult,
  type ModelProgressCallback,
  type TranscriptionProgressCallback,
} from '../utils/whisper'

export class WhisperWorkerService {
  private worker: Worker | null = null
  private requestId = 0
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void
      reject: (error: Error) => void
      onProgress?: ModelProgressCallback | TranscriptionProgressCallback
    }
  >()
  private currentModelName: string | null = null
  private modelLoaded = false
  private currentTranscriptionId: string | null = null

  constructor() {
    this.initializeWorker()
  }

  private initializeWorker() {
    try {
      // Check if Web Workers are supported
      if (typeof Worker === 'undefined') {
        console.warn(
          'Web Workers not supported, falling back to main thread processing'
        )
        return
      }

      // Create worker from the TypeScript file
      this.worker = new Worker(
        new URL('../workers/whisperWorker.ts', import.meta.url),
        { type: 'module' }
      )

      this.worker.onmessage = event => {
        const { type, requestId, ...data } = event.data
        const request = this.pendingRequests.get(requestId)

        if (!request) return

        switch (type) {
          case 'progress':
            if (request.onProgress) {
              ;(request.onProgress as ModelProgressCallback)(data.progress)
            }
            break

          case 'transcription-progress':
            console.log('Received transcription progress:', data.progress)
            if (request.onProgress) {
              ;(request.onProgress as TranscriptionProgressCallback)(
                data.progress
              )
            }
            break

          case 'initialize-success':
            this.currentModelName = data.modelName
            this.modelLoaded = true
            this.pendingRequests.delete(requestId)
            request.resolve(data.modelName)
            break

          case 'transcribe-success':
            this.pendingRequests.delete(requestId)
            request.resolve(data.result)
            break

          case 'error':
            this.pendingRequests.delete(requestId)
            request.reject(new Error(data.error))
            break

          case 'cancelled':
            this.pendingRequests.delete(requestId)
            request.reject(new Error('Operation was cancelled'))
            break
        }
      }

      this.worker.onerror = error => {
        console.error('Worker error:', error)
        // Reject all pending requests
        this.pendingRequests.forEach(request => {
          request.reject(new Error('Worker error'))
        })
        this.pendingRequests.clear()
      }
    } catch (error) {
      console.error('Failed to initialize worker:', error)
    }
  }

  async initializeWhisper(
    modelName: string = 'Xenova/whisper-small',
    onProgress?: ModelProgressCallback
  ): Promise<string> {
    if (!this.worker) {
      throw new Error('Worker not available')
    }

    if (this.currentModelName === modelName && this.modelLoaded) {
      return modelName
    }

    return new Promise((resolve, reject) => {
      const id = `init-${++this.requestId}`

      this.pendingRequests.set(id, {
        resolve,
        reject,
        onProgress,
      })

      this.modelLoaded = false

      this.worker!.postMessage({
        type: 'initialize',
        modelName,
        requestId: id,
      })
    })
  }

  async transcribeAudio(
    audioData: Float32Array,
    options: {
      language?: string
      task?: 'transcribe' | 'translate'
      return_timestamps?: boolean
      chunk_length_s?: number
    } = {},
    onProgress?: TranscriptionProgressCallback
  ): Promise<TranscriptionResult> {
    if (!this.worker) {
      throw new Error('Worker not available')
    }

    if (!this.modelLoaded) {
      throw new Error(
        'Whisper model is not initialized. Call initializeWhisper() first.'
      )
    }

    const id = `transcribe-${++this.requestId}`
    this.currentTranscriptionId = id

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: value => {
          this.currentTranscriptionId = null
          resolve(value)
        },
        reject: error => {
          this.currentTranscriptionId = null
          reject(error)
        },
        onProgress,
      })

      this.worker!.postMessage({
        type: 'transcribe',
        audioData,
        options,
        requestId: id,
      })
    })
  }

  cancelOperation(operationId?: string) {
    if (!this.worker) return

    if (operationId) {
      // Cancel specific operation
      this.worker.postMessage({
        type: 'cancel',
        requestId: operationId,
      })
    } else {
      // Cancel all operations
      this.pendingRequests.forEach((_, requestId) => {
        this.worker!.postMessage({
          type: 'cancel',
          requestId,
        })
      })
    }
  }

  isModelLoaded(): boolean {
    return this.modelLoaded
  }

  getCurrentModelName(): string | null {
    return this.currentModelName
  }

  cleanup() {
    if (this.worker) {
      this.worker.postMessage({ type: 'cleanup' })
      this.worker.terminate()
      this.worker = null
    }
    this.pendingRequests.clear()
    this.modelLoaded = false
    this.currentModelName = null
  }

  // Get current transcription request ID for cancellation
  getCurrentTranscriptionId(): string | null {
    return this.currentTranscriptionId
  }

  // Get last request ID for cancellation (deprecated - use getCurrentTranscriptionId)
  getLastRequestId(): string | null {
    return this.currentTranscriptionId
  }
}

// Create singleton instance
export const whisperService = new WhisperWorkerService()
