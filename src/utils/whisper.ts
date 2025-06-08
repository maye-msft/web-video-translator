// Dynamic imports to prevent automatic loading
// Note: pipeline, AutomaticSpeechRecognitionPipeline, and env are imported dynamically when needed

// Whisper model configuration
export interface WhisperModelConfig {
  name: string
  displayName: string
  size: string
  description: string
}

// Available Whisper models
export const WHISPER_MODELS: WhisperModelConfig[] = [
  {
    name: 'Xenova/whisper-small',
    displayName: 'Whisper Small (Multilingual)',
    size: '~244MB',
    description: 'Good accuracy, supports multiple languages (recommended)'
  },
  {
    name: 'Xenova/whisper-medium',
    displayName: 'Whisper Medium (Multilingual)',
    size: '~769MB',
    description: 'High accuracy, supports multiple languages'
  },
  {
    name: 'Xenova/whisper-large-v3',
    displayName: 'Whisper Large v3 (Multilingual)',
    size: '~1550MB',
    description: 'Highest accuracy, latest model, supports multiple languages'
  },
  {
    name: 'Xenova/whisper-base',
    displayName: 'Whisper Base (Multilingual)',
    size: '~74MB',
    description: 'Faster processing, supports multiple languages'
  },
  {
    name: 'Xenova/whisper-base.en',
    displayName: 'Whisper Base (English)',
    size: '~74MB',
    description: 'Faster processing, English only'
  },
  {
    name: 'Xenova/whisper-small.en',
    displayName: 'Whisper Small (English)',
    size: '~244MB',
    description: 'Good accuracy, English only'
  },
  {
    name: 'Xenova/whisper-medium.en',
    displayName: 'Whisper Medium (English)',
    size: '~769MB',
    description: 'High accuracy, English only'
  },
  {
    name: 'Xenova/whisper-large-v3-turbo',
    displayName: 'Whisper Large v3 Turbo (Multilingual)',
    size: '~809MB',
    description: 'Optimized large model, faster than regular large'
  }
]

// Progress callback types
export type ModelProgressCallback = (progress: { progress: number; loaded: number; total: number }) => void
export type TranscriptionProgressCallback = (progress: number) => void

// Cancellation support
export class TranscriptionCancellation {
  private _cancelled = false
  
  cancel() {
    this._cancelled = true
  }
  
  get cancelled() {
    return this._cancelled
  }
}

// Whisper pipeline instance (using dynamic imports)
let whisperPipeline: any | null = null
let currentModelName: string | null = null

// Cache management
export interface CacheInfo {
  totalSize: number
  modelCount: number
  models: Array<{
    name: string
    size: number
    lastUsed: number
  }>
}

// Transcription result
export interface TranscriptionResult {
  text: string
  chunks: Array<{
    text: string
    timestamp: [number, number]
  }>
}

// SRT subtitle entry
export interface SRTEntry {
  index: number
  startTime: string
  endTime: string
  text: string
}

// Initialize Whisper model
export async function initializeWhisper(
  modelName: string = 'Xenova/whisper-small',
  onProgress?: ModelProgressCallback
): Promise<any> {
  if (whisperPipeline && currentModelName === modelName) {
    return whisperPipeline
  }

  try {
    // Clear existing pipeline if switching models
    if (whisperPipeline && currentModelName !== modelName) {
      whisperPipeline = null
      currentModelName = null
    }

    // Dynamic import to prevent auto-loading
    const { pipeline, env } = await import('@xenova/transformers')
    
    // Configure Transformer.js to use remote models
    env.allowRemoteModels = true
    env.allowLocalModels = false
    env.useBrowserCache = true
    env.remoteHost = 'https://huggingface.co'
    env.remotePathTemplate = '{model}/resolve/main/'

    // Set up progress tracking
    let progressCallback: any
    if (onProgress) {
      progressCallback = (data: any) => {
        if (data.status === 'progress') {
          onProgress({
            progress: data.progress || 0,
            loaded: data.loaded || 0,
            total: data.total || 0
          })
        }
      }
    }

    // Initialize the pipeline with progress tracking
    whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      modelName,
      {
        progress_callback: progressCallback,
        quantized: true, // Use quantized models for better performance
      }
    )

    currentModelName = modelName
    return whisperPipeline
  } catch (error) {
    whisperPipeline = null
    currentModelName = null
    throw new Error(`Failed to initialize Whisper model: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Check if Whisper is loaded
export function isWhisperLoaded(): boolean {
  return whisperPipeline !== null
}

// Get current model name
export function getCurrentModelName(): string | null {
  return currentModelName
}

// Transcribe audio to text with timestamps
export async function transcribeAudio(
  audioData: Float32Array,
  options: {
    language?: string
    task?: 'transcribe' | 'translate'
    return_timestamps?: boolean
    chunk_length_s?: number
  } = {},
  onProgress?: TranscriptionProgressCallback,
  cancellation?: TranscriptionCancellation
): Promise<TranscriptionResult> {
  if (!whisperPipeline) {
    throw new Error('Whisper model is not initialized. Call initializeWhisper() first.')
  }


  try {
    const {
      language = 'english',
      task = 'transcribe',
      return_timestamps = true,
      chunk_length_s = 30
    } = options

    // Check for cancellation before starting
    if (cancellation?.cancelled) {
      throw new Error('Transcription was cancelled')
    }

    // Set up progress tracking with cancellation support
    let progressInterval: NodeJS.Timeout | null = null
    if (onProgress) {
      let progress = 5
      const audioDurationEstimate = audioData.length / 16000 // seconds
      
      // Adjust processing time based on model size
      let modelMultiplier = 2 // default for small models
      if (currentModelName?.includes('medium')) {
        modelMultiplier = 3
      } else if (currentModelName?.includes('large')) {
        modelMultiplier = 4
      } else if (currentModelName?.includes('base')) {
        modelMultiplier = 1.5
      }
      
      const processingTimeEstimate = Math.max(audioDurationEstimate * modelMultiplier, 10) // rough estimate
      const progressIncrement = 85 / (processingTimeEstimate * 2) // reach 90% by estimated completion
      
      onProgress(progress) // Initial progress
      
      progressInterval = setInterval(() => {
        if (cancellation?.cancelled) {
          if (progressInterval) clearInterval(progressInterval)
          return
        }
        progress += progressIncrement + Math.random() * 2
        progress = Math.min(progress, 90) // Don't go above 90% until actually complete
        onProgress(progress)
      }, 500)
    }

    try {
      // Yield control to UI before starting heavy computation
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Check for cancellation after yielding
      if (cancellation?.cancelled) {
        throw new Error('Transcription was cancelled')
      }
      
      // Perform transcription in chunks to allow UI updates
      let result: any
      
      // Try the standard pipeline call first
      try {
        result = await new Promise(async (resolve, reject) => {
          try {
            // Use setTimeout to make the operation async and allow UI updates
            setTimeout(async () => {
              try {
                if (cancellation?.cancelled) {
                  reject(new Error('Transcription was cancelled'))
                  return
                }
                
                const transcriptionResult = await whisperPipeline!(audioData, {
                  language,
                  task,
                  return_timestamps,
                  chunk_length_s,
                  force_full_sequences: false
                })
                resolve(transcriptionResult)
              } catch (error) {
                reject(error)
              }
            }, 10)
          } catch (error) {
            reject(error)
          }
        })
      } catch (pipelineError) {
        // Check for cancellation before trying alternative
        if (cancellation?.cancelled) {
          throw new Error('Transcription was cancelled')
        }
        
        // Alternative approach - some versions of Transformer.js use different call patterns
        if (typeof whisperPipeline === 'object' && whisperPipeline !== null) {
          // Try if it has a transcribe method
          if ('transcribe' in whisperPipeline && typeof (whisperPipeline as any).transcribe === 'function') {
            result = await new Promise(async (resolve, reject) => {
              setTimeout(async () => {
                try {
                  if (cancellation?.cancelled) {
                    reject(new Error('Transcription was cancelled'))
                    return
                  }
                  
                  const transcriptionResult = await (whisperPipeline as any).transcribe(audioData, {
                    language,
                    task,
                    return_timestamps,
                    chunk_length_s
                  })
                  resolve(transcriptionResult)
                } catch (error) {
                  reject(error)
                }
              }, 10)
            })
          } else {
            // Re-throw the original error if no alternative works
            throw pipelineError
          }
        } else {
          throw pipelineError
        }
      }

      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval)
        onProgress?.(100)
      }

      // Process results
      const resultData = result as any // Type assertion for flexibility
      if (resultData.chunks && Array.isArray(resultData.chunks)) {
        return {
          text: resultData.text || '',
          chunks: resultData.chunks.map((chunk: any) => ({
            text: chunk.text || '',
            timestamp: chunk.timestamp || [0, 0]
          }))
        }
      } else {
        // Handle simple text result
        const textResult = resultData.text || resultData || ''
        return {
          text: textResult,
          chunks: [{
            text: textResult,
            timestamp: [0, audioData.length / 16000] // Estimate duration based on sample rate
          }]
        }
      }
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  } catch (error) {
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Convert audio file to Float32Array for Whisper
export async function preprocessAudio(audioFile: File): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        // Convert to mono and resample to 16kHz (Whisper requirement)
        const targetSampleRate = 16000
        const sourceData = audioBuffer.getChannelData(0) // Use first channel (mono)
        
        if (audioBuffer.sampleRate === targetSampleRate) {
          resolve(sourceData)
        } else {
          // Simple resampling
          const ratio = audioBuffer.sampleRate / targetSampleRate
          const newLength = Math.round(sourceData.length / ratio)
          const resampledData = new Float32Array(newLength)
          
          for (let i = 0; i < newLength; i++) {
            const srcIndex = Math.round(i * ratio)
            resampledData[i] = sourceData[srcIndex] || 0
          }
          
          resolve(resampledData)
        }
      } catch (error) {
        reject(new Error(`Audio preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read audio file'))
    }

    reader.readAsArrayBuffer(audioFile)
  })
}

// Generate SRT format from transcription result
export function generateSRT(transcriptionResult: TranscriptionResult): string {
  const entries: SRTEntry[] = transcriptionResult.chunks.map((chunk, index) => ({
    index: index + 1,
    startTime: formatSRTTimestamp(chunk.timestamp[0]),
    endTime: formatSRTTimestamp(chunk.timestamp[1]),
    text: chunk.text.trim()
  })).filter(entry => entry.text.length > 0)

  return entries.map(entry => 
    `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}\n`
  ).join('\n')
}

// Format timestamp for SRT format (HH:MM:SS,mmm)
function formatSRTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
}

// Cache management functions
export async function getCacheInfo(): Promise<CacheInfo> {
  try {
    // Try to estimate cache size from IndexedDB
    if ('storage' in navigator && navigator.storage && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        totalSize: estimate.usage || 0,
        modelCount: 0, // Cannot accurately count models
        models: []
      }
    }
    
    return {
      totalSize: 0,
      modelCount: 0,
      models: []
    }
  } catch (error) {
    console.warn('Failed to get cache info:', error)
    return {
      totalSize: 0,
      modelCount: 0,
      models: []
    }
  }
}

// Clear model cache
export async function clearModelCache(): Promise<void> {
  try {
    // Clear Transformer.js cache
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const transformerCaches = cacheNames.filter(name => 
        name.includes('transformers') || name.includes('huggingface')
      )
      
      await Promise.all(
        transformerCaches.map(cacheName => caches.delete(cacheName))
      )
    }

    // Clear IndexedDB data used by Transformer.js
    if ('indexedDB' in window) {
      const databases = ['transformers-cache', 'huggingface-cache']
      await Promise.all(
        databases.map(dbName => {
          return new Promise<void>((resolve) => {
            const deleteReq = indexedDB.deleteDatabase(dbName)
            deleteReq.onsuccess = () => resolve()
            deleteReq.onerror = () => resolve() // Ignore errors
          })
        })
      )
    }

    // Reset pipeline state
    whisperPipeline = null
    currentModelName = null
  } catch (error) {
    throw new Error(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Download file helper for SRT
export function downloadSRT(srtContent: string, filename: string = 'subtitles.srt'): void {
  const blob = new Blob([srtContent], { type: 'text/plain; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Cleanup Whisper resources
export function cleanupWhisper(): void {
  whisperPipeline = null
  currentModelName = null
}