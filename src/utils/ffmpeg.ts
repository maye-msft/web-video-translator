import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

// FFmpeg singleton instance
let ffmpegInstance: FFmpeg | null = null

// Progress callback type
export type ProgressCallback = (progress: number) => void

// FFmpeg initialization status
export interface FFmpegStatus {
  loaded: boolean
  loading: boolean
  error: string | null
}

// Initialize FFmpeg instance with proper configuration
export async function initializeFFmpeg(
  onProgress?: ProgressCallback,
  onLog?: (message: string) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance
  }

  try {
    // Create new FFmpeg instance
    ffmpegInstance = new FFmpeg()

    // Set up logging
    if (onLog) {
      ffmpegInstance.on('log', ({ message }) => {
        onLog(message)
      })
    }

    // Set up progress tracking
    if (onProgress) {
      ffmpegInstance.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100))
      })
    }

    // Load FFmpeg core with proper CORS configuration
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    return ffmpegInstance
  } catch (error) {
    ffmpegInstance = null
    throw new Error(`Failed to initialize FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get current FFmpeg instance
export function getFFmpegInstance(): FFmpeg | null {
  return ffmpegInstance
}

// Check if FFmpeg is loaded
export function isFFmpegLoaded(): boolean {
  return ffmpegInstance?.loaded ?? false
}

// Extract audio from video file
export async function extractAudio(
  videoFile: File,
  outputFormat: 'wav' | 'mp3' = 'wav',
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (!ffmpegInstance || !ffmpegInstance.loaded) {
    throw new Error('FFmpeg is not initialized. Call initializeFFmpeg() first.')
  }

  try {
    const inputFileName = 'input.' + getFileExtension(videoFile.name)
    const outputFileName = `output.${outputFormat}`

    // Write input file to FFmpeg file system
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(videoFile))

    // Set up progress tracking for this operation
    let operationProgress = 0
    const progressHandler = ({ progress }: { progress: number }) => {
      operationProgress = Math.round(progress * 100)
      onProgress?.(operationProgress)
    }

    ffmpegInstance.on('progress', progressHandler)

    try {
      // Extract audio using FFmpeg
      const ffmpegArgs = [
        '-i', inputFileName,
        '-vn', // No video
        '-acodec', outputFormat === 'wav' ? 'pcm_s16le' : 'mp3',
        '-ar', '44100', // Sample rate
        '-ac', '2', // Stereo
        outputFileName
      ]

      await ffmpegInstance.exec(ffmpegArgs)

      // Read the output file
      const outputData = await ffmpegInstance.readFile(outputFileName)

      // Clean up files from FFmpeg file system
      await ffmpegInstance.deleteFile(inputFileName)
      await ffmpegInstance.deleteFile(outputFileName)

      return outputData as Uint8Array
    } finally {
      // Remove progress handler
      ffmpegInstance.off('progress', progressHandler)
    }
  } catch (error) {
    throw new Error(`Audio extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Convert video to different format
export async function convertVideo(
  videoFile: File,
  outputFormat: string,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (!ffmpegInstance || !ffmpegInstance.loaded) {
    throw new Error('FFmpeg is not initialized. Call initializeFFmpeg() first.')
  }

  try {
    const inputFileName = 'input.' + getFileExtension(videoFile.name)
    const outputFileName = `output.${outputFormat}`

    await ffmpegInstance.writeFile(inputFileName, await fetchFile(videoFile))

    const progressHandler = ({ progress }: { progress: number }) => {
      onProgress?.(Math.round(progress * 100))
    }

    ffmpegInstance.on('progress', progressHandler)

    try {
      await ffmpegInstance.exec([
        '-i', inputFileName,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        outputFileName
      ])

      const outputData = await ffmpegInstance.readFile(outputFileName)

      await ffmpegInstance.deleteFile(inputFileName)
      await ffmpegInstance.deleteFile(outputFileName)

      return outputData as Uint8Array
    } finally {
      ffmpegInstance.off('progress', progressHandler)
    }
  } catch (error) {
    throw new Error(`Video conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Utility function to get file extension
function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'mp4'
}

// Download file helper
export function downloadFile(data: Uint8Array, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType })
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

// Cleanup FFmpeg instance
export function cleanupFFmpeg(): void {
  if (ffmpegInstance) {
    // Note: FFmpeg doesn't have a cleanup method in the current version
    // Memory will be cleaned up by garbage collection
    ffmpegInstance = null
  }
}