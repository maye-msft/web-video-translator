// Service to manage MarianMT Translation Web Worker
import {
  type TranslationResult,
  type TranslationProgressCallback,
} from '../utils/translation'

export class TranslationWorkerService {
  private worker: Worker | null = null
  private requestId = 0
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void
      reject: (error: Error) => void
      onProgress?: TranslationProgressCallback
    }
  >()
  private currentModelId: string | null = null
  private modelLoaded = false
  private currentTranslationId: string | null = null

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
        new URL('../workers/translationWorker.ts', import.meta.url),
        { type: 'module' }
      )

      this.worker.onmessage = event => {
        const { type, requestId, ...data } = event.data
        const request = this.pendingRequests.get(requestId)

        if (!request) return

        switch (type) {
          case 'model-progress':
            if (request.onProgress) {
              ;(request.onProgress as TranslationProgressCallback)(
                data.progress.progress || 0
              )
            }
            break

          case 'translation-progress':
            console.log('Received translation progress:', data.progress)
            if (request.onProgress) {
              // Forward the full progress object
              ;(request.onProgress as TranslationProgressCallback)(
                data.progress
              )
            }
            break

          case 'initialize-success':
            this.currentModelId = data.modelId
            this.modelLoaded = true
            this.pendingRequests.delete(requestId)
            request.resolve(data.modelId)
            break

          case 'translate-success':
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
        console.error('Translation worker error:', error)
        // Reject all pending requests
        this.pendingRequests.forEach(request => {
          request.reject(new Error('Worker error'))
        })
        this.pendingRequests.clear()
      }
    } catch (error) {
      console.error('Failed to initialize translation worker:', error)
    }
  }

  async initializeModel(
    modelId: string,
    onProgress?: TranslationProgressCallback
  ): Promise<string> {
    if (!this.worker) {
      throw new Error('Worker not available')
    }

    if (this.currentModelId === modelId && this.modelLoaded) {
      return modelId
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
        modelId,
        requestId: id,
      })
    })
  }

  async translateText(
    texts: string[],
    options: {
      sourceLanguage?: string
      targetLanguage?: string
      maxLength?: number
    } = {},
    onProgress?: TranslationProgressCallback
  ): Promise<TranslationResult> {
    if (!this.worker) {
      throw new Error('Worker not available')
    }

    if (!this.modelLoaded) {
      throw new Error(
        'Translation model is not initialized. Call initializeModel() first.'
      )
    }

    return new Promise((resolve, reject) => {
      const id = `translate-${++this.requestId}`
      this.currentTranslationId = id

      this.pendingRequests.set(id, {
        resolve,
        reject,
        onProgress,
      })

      this.worker!.postMessage({
        type: 'translate',
        texts,
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

  getCurrentModelId(): string | null {
    return this.currentModelId
  }

  getCurrentTranslationId(): string | null {
    return this.currentTranslationId
  }

  async getMemoryInfo(): Promise<{
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }> {
    // Get memory info from performance.memory if available
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory
      return {
        usedJSHeapSize: memoryInfo.usedJSHeapSize,
        totalJSHeapSize: memoryInfo.totalJSHeapSize,
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
      }
    }
    return {}
  }

  cleanup() {
    if (this.worker) {
      this.worker.postMessage({ type: 'cleanup' })
      this.worker.terminate()
      this.worker = null
    }
    this.pendingRequests.clear()
    this.modelLoaded = false
    this.currentModelId = null
    this.currentTranslationId = null
  }
}

// Create singleton instance
export const translationService = new TranslationWorkerService()
