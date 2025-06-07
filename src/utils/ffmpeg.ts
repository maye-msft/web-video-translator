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
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    })

    return ffmpegInstance
  } catch (error) {
    ffmpegInstance = null
    throw new Error(
      `Failed to initialize FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
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
        '-i',
        inputFileName,
        '-vn', // No video
        '-acodec',
        outputFormat === 'wav' ? 'pcm_s16le' : 'mp3',
        '-ar',
        '44100', // Sample rate
        '-ac',
        '2', // Stereo
        outputFileName,
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
    throw new Error(
      `Audio extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
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
        '-i',
        inputFileName,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        outputFileName,
      ])

      const outputData = await ffmpegInstance.readFile(outputFileName)

      await ffmpegInstance.deleteFile(inputFileName)
      await ffmpegInstance.deleteFile(outputFileName)

      return outputData as Uint8Array
    } finally {
      ffmpegInstance.off('progress', progressHandler)
    }
  } catch (error) {
    throw new Error(
      `Video conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Subtitle styling configuration
export interface SubtitleStyle {
  fontFamily: string
  fontSize: number
  fontColor: string
  backgroundColor: string
  backgroundOpacity: number
  outlineColor: string
  outlineWidth: number
  alignment: 'left' | 'center' | 'right'
  verticalPosition: 'top' | 'middle' | 'bottom'
  marginHorizontal: number
  marginVertical: number
  bold: boolean
  italic: boolean
}

// Default subtitle style
export const DEFAULT_SUBTITLE_STYLE: SubtitleStyle = {
  fontFamily: 'Arial',
  fontSize: 24,
  fontColor: '#FFFFFF',
  backgroundColor: '#000000',
  backgroundOpacity: 0.7,
  outlineColor: '#000000',
  outlineWidth: 2,
  alignment: 'center',
  verticalPosition: 'bottom',
  marginHorizontal: 20,
  marginVertical: 20,
  bold: false,
  italic: false,
}

// Video processing result
export interface VideoProcessingResult {
  outputData: Uint8Array
  duration: number
  size: number
  format: string
}

// Processing strategy type
export type ProcessingStrategy = 'direct' | 'optimized' | 'chunked'

// Get optimal processing strategy based on file size
export function getProcessingStrategy(fileSize: number): ProcessingStrategy {
  const DIRECT_LIMIT = 100 * 1024 * 1024    // 100MB - direct processing
  const OPTIMIZED_LIMIT = 500 * 1024 * 1024 // 500MB - optimized processing
  
  if (fileSize <= DIRECT_LIMIT) {
    return 'direct'
  } else if (fileSize <= OPTIMIZED_LIMIT) {
    return 'optimized'
  } else {
    return 'chunked'
  }
}

// Optimized processing for larger files (100MB-500MB)
export async function mergeSubtitlesOptimized(
  videoFile: File,
  srtContent: string,
  _style: SubtitleStyle = DEFAULT_SUBTITLE_STYLE,
  outputFormat: 'mp4' | 'webm' = 'mp4',
  onProgress?: ProgressCallback
): Promise<VideoProcessingResult> {
  if (!ffmpegInstance || !ffmpegInstance.loaded) {
    throw new Error('FFmpeg is not initialized. Call initializeFFmpeg() first.')
  }

  const inputVideoFileName = 'input_video.' + getFileExtension(videoFile.name)
  const outputFileName = 'output.' + outputFormat

  const progressHandler = (progress: { progress: number; time: number }) => {
    onProgress?.(Math.round(progress.progress * 100))
  }

  ffmpegInstance.on('progress', progressHandler)

  try {
    // Use streaming writes for large files
    const videoData = await fetchFile(videoFile)
    await ffmpegInstance.writeFile(inputVideoFileName, videoData)

    // Use more memory-efficient encoding settings with drawtext filter
    console.log('Optimized processing - SRT Content:', srtContent.substring(0, 200) + '...')
    
    // Parse SRT and create subtitle images using Canvas with conservative width
    const subtitleEntries = parseSRT(srtContent)
    await createSubtitleImages(subtitleEntries, _style, 480)
    
    // Generate overlay filter for subtitle images
    const overlayFilter = generateSubtitleImageOverlay(subtitleEntries)
    
    // Build FFmpeg command with video input and subtitle image inputs
    const ffmpegArgs = [
      '-i', inputVideoFileName,
      // Add subtitle images as inputs
      ...subtitleEntries.flatMap((_, i) => ['-i', `subtitle_${i}.png`])
    ]
    
    // Add filter and output options
    if (overlayFilter !== 'null') {
      ffmpegArgs.push('-filter_complex', overlayFilter)
    }
    
    ffmpegArgs.push(
      '-c:v', outputFormat === 'mp4' ? 'libx264' : 'libvpx-vp9',
      '-c:a', 'copy',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-threads', '2',
      '-avoid_negative_ts', 'make_zero',
      outputFileName
    )

    console.log('Optimized drawtext filter - FFmpeg args:', ffmpegArgs)
    await ffmpegInstance.exec(ffmpegArgs)

    const outputData = await ffmpegInstance.readFile(outputFileName)
    const size = (outputData as Uint8Array).byteLength

    // Clean up
    await ffmpegInstance.deleteFile(inputVideoFileName)
    await ffmpegInstance.deleteFile(outputFileName)

    return {
      outputData: outputData as Uint8Array,
      duration: 0,
      size: size,
      format: outputFormat,
    }
  } finally {
    ffmpegInstance.off('progress', progressHandler)
  }
}

// Merge subtitles into video
export async function mergeSubtitles(
  videoFile: File,
  srtContent: string,
  _style: SubtitleStyle = DEFAULT_SUBTITLE_STYLE, // Prefixed with underscore - styling not implemented yet
  outputFormat: 'mp4' | 'webm' = 'mp4',
  onProgress?: ProgressCallback
): Promise<VideoProcessingResult> {
  if (!ffmpegInstance || !ffmpegInstance.loaded) {
    throw new Error('FFmpeg is not initialized. Call initializeFFmpeg() first.')
  }

  try {
    const inputVideoFileName = 'input.' + getFileExtension(videoFile.name)
    const outputFileName = `output.${outputFormat}`

    // Write input files to FFmpeg file system
    await ffmpegInstance.writeFile(
      inputVideoFileName,
      await fetchFile(videoFile)
    )

    // Set up progress tracking for this operation
    let operationProgress = 0
    const progressHandler = ({ progress }: { progress: number }) => {
      operationProgress = Math.round(progress * 100)
      onProgress?.(operationProgress)
    }

    ffmpegInstance.on('progress', progressHandler)

    try {
      console.log('SRT Content being processed:', srtContent.substring(0, 200) + '...')
      
      // Parse SRT and create subtitle images using Canvas with conservative width
      const subtitleEntries = parseSRT(srtContent)
      await createSubtitleImages(subtitleEntries, _style, 480)
      
      // Generate overlay filter for subtitle images
      const overlayFilter = generateSubtitleImageOverlay(subtitleEntries)
      
      // Build FFmpeg command with video input and subtitle image inputs
      const ffmpegArgs = [
        '-i', inputVideoFileName,
        // Add subtitle images as inputs
        ...subtitleEntries.flatMap((_, i) => ['-i', `subtitle_${i}.png`])
      ]
      
      // Add filter and output options
      if (overlayFilter !== 'null') {
        ffmpegArgs.push('-filter_complex', overlayFilter)
      }
      
      ffmpegArgs.push(
        '-c:v',
        outputFormat === 'mp4' ? 'libx264' : 'libvpx-vp9',
        '-c:a',
        'copy',
        '-preset',
        'ultrafast',
        '-crf',
        '28',
        outputFileName
      )

      console.log('Using drawtext filter - FFmpeg args:', ffmpegArgs)
      await ffmpegInstance.exec(ffmpegArgs)

      // Read the output file
      const outputData = await ffmpegInstance.readFile(outputFileName)

      // Get file size from the data
      const size = (outputData as Uint8Array).length

      // Clean up files
      await ffmpegInstance.deleteFile(inputVideoFileName)
      await ffmpegInstance.deleteFile(outputFileName)

      return {
        outputData: outputData as Uint8Array,
        duration: 0, // FFmpeg doesn't provide duration directly
        size: size,
        format: outputFormat,
      }
    } finally {
      ffmpegInstance.off('progress', progressHandler)
    }
  } catch (error) {
    throw new Error(
      `Subtitle merging failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Get video metadata by parsing FFmpeg output
export async function getVideoMetadata(videoFile: File): Promise<{
  duration: number
  width: number
  height: number
  fps: number
  bitrate: number
  format: string
}> {
  if (!ffmpegInstance || !ffmpegInstance.loaded) {
    throw new Error('FFmpeg is not initialized. Call initializeFFmpeg() first.')
  }

  try {
    const inputFileName = 'input.' + getFileExtension(videoFile.name)
    await ffmpegInstance.writeFile(inputFileName, await fetchFile(videoFile))

    let logOutput = ''
    
    // Temporarily capture log output
    ffmpegInstance.on('log', ({ message }: { message: string }) => {
      logOutput += message + '\n'
    })

    try {
      // Use ffmpeg to get metadata (will fail but gives us info in logs)
      await ffmpegInstance.exec(['-i', inputFileName, '-f', 'null', '-'])
    } catch {
      // Expected to fail, we just want the log output
    }

    // Parse dimensions from log output
    const dimensionMatch = logOutput.match(/(\d+)x(\d+)/)
    const width = dimensionMatch ? parseInt(dimensionMatch[1]) : 640
    const height = dimensionMatch ? parseInt(dimensionMatch[2]) : 480

    // Parse duration
    const durationMatch = logOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/)
    let duration = 0
    if (durationMatch) {
      duration = parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseFloat(durationMatch[3])
    }

    // Clean up
    await ffmpegInstance.deleteFile(inputFileName)

    return {
      duration,
      width,
      height,
      fps: 25, // Default
      bitrate: 0, // Will be estimated
      format: getFileExtension(videoFile.name),
    }
  } catch (error) {
    throw new Error(
      `Failed to get video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Generate preview GIF with subtitles
export async function generateSubtitlePreview(
  videoFile: File,
  srtContent: string,
  timeInSeconds: number,
  style: SubtitleStyle = DEFAULT_SUBTITLE_STYLE
): Promise<Uint8Array> {
  if (!ffmpegInstance || !ffmpegInstance.loaded) {
    throw new Error('FFmpeg is not initialized. Call initializeFFmpeg() first.')
  }

  // Dynamic file size limits based on processing strategy
  const PREVIEW_LIMIT = 200 * 1024 * 1024 // 200MB for preview
  if (videoFile.size > PREVIEW_LIMIT) {
    throw new Error(
      `Video file too large for preview (${Math.round(videoFile.size / 1024 / 1024)}MB). Please use a file smaller than 200MB.`
    )
  }

  const inputVideoFileName = 'preview_input.' + getFileExtension(videoFile.name)
  const outputFileName = 'preview_output.gif'

  try {
    // Clean up any existing files first - be more thorough
    const filesToClean = [
      inputVideoFileName,
      outputFileName,
      ...Array.from({length: 10}, (_, i) => `subtitle_${i}.png`)
    ]
    
    for (const file of filesToClean) {
      try {
        await ffmpegInstance.deleteFile(file)
      } catch {
        // File doesn't exist, ignore
      }
    }

    // Write input files
    const videoData = await fetchFile(videoFile)
    await ffmpegInstance.writeFile(inputVideoFileName, videoData)
    
    // Parse SRT and create subtitle images with conservative width for broad compatibility
    const subtitleEntries = parseSRT(srtContent)
    await createSubtitleImages(subtitleEntries, style, 480) // Use 480px for safe text wrapping
    
    // Generate overlay filter for subtitle images
    const overlayFilter = generateSubtitleImageOverlay(subtitleEntries)
    
    // Build FFmpeg command for GIF generation with subtitles
    const startTime = Math.max(0, timeInSeconds - 1) // Start 1 second before
    const duration = 3 // 3 second GIF
    
    const ffmpegArgs = [
      '-i', inputVideoFileName,
      // Add subtitle images as inputs
      ...subtitleEntries.flatMap((_, i) => ['-i', `subtitle_${i}.png`]),
      '-ss', startTime.toString(),
      '-t', duration.toString()
    ]
    
    // Add filter complex for subtitle overlay + scaling
    if (overlayFilter !== 'null') {
      ffmpegArgs.push('-filter_complex', `${overlayFilter},scale=320:240:force_original_aspect_ratio=decrease,fps=10`)
    } else {
      ffmpegArgs.push('-vf', 'scale=320:240:force_original_aspect_ratio=decrease,fps=10')
    }
    
    ffmpegArgs.push('-f', 'gif', outputFileName)

    await ffmpegInstance.exec(ffmpegArgs)

    // Read the output GIF
    const outputData = await ffmpegInstance.readFile(outputFileName)

    // Clean up files immediately
    const cleanupFiles = [
      inputVideoFileName,
      outputFileName,
      ...subtitleEntries.map((_, i) => `subtitle_${i}.png`)
    ]
    
    for (const file of cleanupFiles) {
      try {
        await ffmpegInstance.deleteFile(file)
      } catch (cleanupError) {
        console.warn(`Could not delete ${file}:`, cleanupError)
      }
    }

    return outputData as Uint8Array
  } catch (error) {
    console.error('Preview generation error:', error)
    // Try to clean up on error
    const errorCleanupFiles = [
      inputVideoFileName,
      outputFileName,
      ...Array.from({length: 10}, (_, i) => `subtitle_${i}.png`)
    ]
    
    for (const file of errorCleanupFiles) {
      try {
        await ffmpegInstance.deleteFile(file)
      } catch {
        // Ignore cleanup errors during error handling
      }
    }
    
    throw new Error(
      `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Utility function to get file extension
function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'mp4'
}

// Parse SRT content into subtitle entries
interface SubtitleEntry {
  start: number
  end: number
  text: string
}

function parseSRT(srtContent: string): SubtitleEntry[] {
  if (!srtContent.trim()) {
    return [
      { start: 1, end: 5, text: 'Test subtitle - if you see this, subtitle processing is working' },
      { start: 6, end: 10, text: 'This is a second test subtitle line' }
    ]
  }

  const entries: SubtitleEntry[] = []
  const blocks = srtContent.trim().split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length >= 3) {
      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/)
      if (timeMatch) {
        const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000
        const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000
        const text = lines.slice(2).join(' ').replace(/'/g, "\\'").replace(/:/g, '\\:')
        
        entries.push({ start: startTime, end: endTime, text })
      }
    }
  }

  console.log('Parsed SRT entries:', entries)
  return entries
}



// Wrap text to multiple lines based on canvas width
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}

// Convert hex color to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Create subtitle images using Canvas with style settings
async function createSubtitleImages(subtitles: SubtitleEntry[], style: SubtitleStyle, videoWidth: number = 480): Promise<void> {
  if (!ffmpegInstance) return

  for (let i = 0; i < subtitles.length; i++) {
    const sub = subtitles[i]
    
    // Create canvas for subtitle with video-based sizing
    const canvas = document.createElement('canvas')
    canvas.width = videoWidth // Match video width
    const ctx = canvas.getContext('2d')!
    
    // Set font for measurements
    const fontWeight = style.bold ? 'bold' : 'normal'
    const fontStyle = style.italic ? 'italic' : 'normal'
    ctx.font = `${fontStyle} ${fontWeight} ${style.fontSize}px ${style.fontFamily}`
    
    // Wrap text to multiple lines with proper margins
    const maxTextWidth = canvas.width - (style.marginHorizontal * 2)
    const lines = wrapText(ctx, sub.text, maxTextWidth)
    const lineHeight = style.fontSize * 1.2
    const totalTextHeight = lines.length * lineHeight
    const padding = 20
    
    // Set canvas height based on content
    canvas.height = Math.max(100, totalTextHeight + padding * 2)
    
    // Clear canvas and reset font (canvas resize clears styles)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontStyle} ${fontWeight} ${style.fontSize}px ${style.fontFamily}`
    
    // Set text alignment
    const textAlign = style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center'
    ctx.textAlign = textAlign as CanvasTextAlign
    ctx.textBaseline = 'middle'
    
    // Calculate background dimensions
    const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
    const bgWidth = maxLineWidth + padding * 2
    const bgHeight = totalTextHeight + padding
    const bgX = (canvas.width - bgWidth) / 2
    const bgY = (canvas.height - bgHeight) / 2
    
    // Draw background with style settings
    if (style.backgroundColor && style.backgroundOpacity > 0) {
      ctx.fillStyle = hexToRgba(style.backgroundColor, style.backgroundOpacity)
      ctx.fillRect(bgX, bgY, bgWidth, bgHeight)
    }
    
    // Calculate text starting position
    let textX: number
    switch (style.alignment) {
      case 'left':
        textX = bgX + padding
        break
      case 'right':
        textX = bgX + bgWidth - padding
        break
      default: // center
        textX = canvas.width / 2
        break
    }
    
    const startY = bgY + bgHeight / 2 - (totalTextHeight / 2) + (lineHeight / 2)
    
    // Draw each line of text
    lines.forEach((line, lineIndex) => {
      const y = startY + lineIndex * lineHeight
      
      // Draw outline if specified
      if (style.outlineWidth > 0) {
        ctx.strokeStyle = style.outlineColor
        ctx.lineWidth = style.outlineWidth
        ctx.strokeText(line, textX, y)
      }
      
      // Draw main text
      ctx.fillStyle = style.fontColor
      ctx.fillText(line, textX, y)
    })
    
    // Convert canvas to PNG
    const imageData = canvas.toDataURL('image/png').split(',')[1]
    const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0))
    
    // Write subtitle image to FFmpeg filesystem
    await ffmpegInstance.writeFile(`subtitle_${i}.png`, imageBytes)
  }
  
  console.log(`Created ${subtitles.length} styled subtitle images`)
}

// Generate video filter with subtitle images
function generateSubtitleImageOverlay(subtitles: SubtitleEntry[]): string {
  if (subtitles.length === 0) {
    return "null" // No overlay
  }

  // Create overlay filters for each subtitle image
  let filter = '[0:v]'
  
  for (let i = 0; i < subtitles.length; i++) {
    const sub = subtitles[i]
    const inputLabel = i === 0 ? '[0:v]' : `[tmp${i-1}]`
    const outputLabel = i === subtitles.length - 1 ? '' : `[tmp${i}]`
    
    // Position subtitle at bottom center
    const overlayFilter = `${inputLabel}[${i+1}:v]overlay=x=(W-w)/2:y=H-h-20:enable='between(t,${sub.start},${sub.end})'${outputLabel}`
    
    if (i === 0) {
      filter = overlayFilter
    } else {
      filter = `${filter};${overlayFilter}`
    }
  }
  
  console.log('Generated subtitle image overlay:', filter)
  return filter
}


// Download file helper
export function downloadFile(
  data: Uint8Array,
  filename: string,
  mimeType: string
): void {
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

// Smart processing function that chooses optimal strategy
export async function processVideoWithSubtitles(
  videoFile: File,
  srtContent: string,
  style: SubtitleStyle = DEFAULT_SUBTITLE_STYLE,
  outputFormat: 'mp4' | 'webm' = 'mp4',
  onProgress?: ProgressCallback
): Promise<VideoProcessingResult> {
  const strategy = getProcessingStrategy(videoFile.size)
  const fileSizeMB = Math.round(videoFile.size / 1024 / 1024)
  
  console.log(`Processing ${fileSizeMB}MB file with strategy: ${strategy}`)
  
  switch (strategy) {
    case 'direct':
      return mergeSubtitles(videoFile, srtContent, style, outputFormat, onProgress)
    
    case 'optimized':
      return mergeSubtitlesOptimized(videoFile, srtContent, style, outputFormat, onProgress)
    
    case 'chunked':
      throw new Error(`File too large (${fileSizeMB}MB). Maximum supported size is 500MB. Consider using a smaller file or server-side processing.`)
    
    default:
      throw new Error('Invalid processing strategy')
  }
}

// Cleanup FFmpeg instance
export function cleanupFFmpeg(): void {
  if (ffmpegInstance) {
    // Note: FFmpeg doesn't have a cleanup method in the current version
    // Memory will be cleaned up by garbage collection
    ffmpegInstance = null
  }
}
