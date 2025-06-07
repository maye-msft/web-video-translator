import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  initializeFFmpeg, 
  extractAudio, 
  isFFmpegLoaded, 
  getFFmpegInstance,
  downloadFile,
  cleanupFFmpeg
} from '../src/utils/ffmpeg'

// Mock FFmpeg dependencies
const mockFFmpegInstance = {
  loaded: false,
  load: vi.fn().mockImplementation(function(this: any) {
    this.loaded = true
    return Promise.resolve()
  }),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  exec: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn()
}

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({ ...mockFFmpegInstance }))
}))

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
  toBlobURL: vi.fn().mockResolvedValue('mocked-blob-url')
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock DOM methods for downloadFile
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()

Object.defineProperty(document, 'body', {
  value: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild
  },
  writable: true
})

Object.defineProperty(document, 'createElement', {
  value: vi.fn().mockReturnValue({
    href: '',
    download: '',
    style: { display: '' },
    click: mockClick
  }),
  writable: true
})

describe('FFmpeg Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanupFFmpeg()
  })

  afterEach(() => {
    cleanupFFmpeg()
  })

  describe('initializeFFmpeg', () => {
    it('should initialize FFmpeg successfully', async () => {
      const onProgress = vi.fn()
      const onLog = vi.fn()

      const ffmpeg = await initializeFFmpeg(onProgress, onLog)

      expect(ffmpeg).toBeDefined()
      expect(ffmpeg.loaded).toBe(true)
    })

    it('should return existing instance if already loaded', async () => {
      // Initialize first time
      const ffmpeg1 = await initializeFFmpeg()
      // Initialize second time
      const ffmpeg2 = await initializeFFmpeg()

      expect(ffmpeg1).toBe(ffmpeg2)
    })

    it('should handle initialization errors', async () => {
      // Reset the mock to simulate error
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      ;(FFmpeg as any).mockImplementationOnce(() => ({
        ...mockFFmpegInstance,
        load: vi.fn().mockRejectedValue(new Error('Load failed'))
      }))

      // Clear any existing instance
      cleanupFFmpeg()

      await expect(initializeFFmpeg()).rejects.toThrow('Failed to initialize FFmpeg: Load failed')
    })
  })

  describe('extractAudio', () => {
    it('should extract audio successfully', async () => {
      // Initialize FFmpeg first
      await initializeFFmpeg()

      const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })
      const onProgress = vi.fn()

      const result = await extractAudio(testFile, 'wav', onProgress)

      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should extract MP3 audio with correct codec', async () => {
      await initializeFFmpeg()

      const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      const result = await extractAudio(testFile, 'mp3')

      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should throw error if FFmpeg not initialized', async () => {
      const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      await expect(extractAudio(testFile)).rejects.toThrow('FFmpeg is not initialized')
    })

    it('should handle extraction errors', async () => {
      // Mock failed exec
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      ;(FFmpeg as any).mockImplementationOnce(() => ({
        ...mockFFmpegInstance,
        loaded: true,
        exec: vi.fn().mockRejectedValue(new Error('Extraction failed'))
      }))

      cleanupFFmpeg()
      await initializeFFmpeg()

      const testFile = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      await expect(extractAudio(testFile)).rejects.toThrow('Audio extraction failed: Extraction failed')
    })
  })

  describe('isFFmpegLoaded', () => {
    it('should return false when FFmpeg not initialized', () => {
      expect(isFFmpegLoaded()).toBe(false)
    })

    it('should return true when FFmpeg is loaded', async () => {
      await initializeFFmpeg()
      expect(isFFmpegLoaded()).toBe(true)
    })
  })

  describe('getFFmpegInstance', () => {
    it('should return null when not initialized', () => {
      expect(getFFmpegInstance()).toBeNull()
    })

    it('should return instance when initialized', async () => {
      const ffmpeg = await initializeFFmpeg()
      expect(getFFmpegInstance()).toBe(ffmpeg)
    })
  })

  describe('downloadFile', () => {
    it('should trigger file download', () => {
      const testData = new Uint8Array([1, 2, 3, 4])
      const filename = 'test.wav'
      const mimeType = 'audio/wav'

      downloadFile(testData, filename, mimeType)

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('cleanupFFmpeg', () => {
    it('should cleanup FFmpeg instance', async () => {
      await initializeFFmpeg()
      expect(getFFmpegInstance()).not.toBeNull()

      cleanupFFmpeg()
      expect(getFFmpegInstance()).toBeNull()
    })
  })
})