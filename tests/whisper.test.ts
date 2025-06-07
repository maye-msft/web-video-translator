import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @xenova/transformers
vi.mock('@xenova/transformers', () => ({
  pipeline: vi.fn().mockResolvedValue(() => ({
    text: 'Hello, this is a test transcription.',
    chunks: [
      {
        text: 'Hello, this is a test',
        timestamp: [0, 2.5]
      },
      {
        text: 'transcription.',
        timestamp: [2.5, 4.0]
      }
    ]
  }))
}))

// Mock browser APIs
global.AudioContext = vi.fn().mockImplementation(() => ({
  decodeAudioData: vi.fn().mockResolvedValue({
    sampleRate: 44100,
    getChannelData: vi.fn().mockReturnValue(new Float32Array(44100))
  })
}))

global.FileReader = vi.fn().mockImplementation(() => ({
  readAsArrayBuffer: vi.fn(),
  onload: null,
  onerror: null,
  result: new ArrayBuffer(1024)
}))

// Mock DOM methods for file download
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

global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

// Mock navigator.storage
Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: vi.fn().mockResolvedValue({
      usage: 1024 * 1024 * 50,
      quota: 1024 * 1024 * 1024
    })
  },
  writable: true
})

// Mock caches API
global.caches = {
  keys: vi.fn().mockResolvedValue(['transformers-cache-v1']),
  delete: vi.fn().mockResolvedValue(true)
} as any

// Mock IndexedDB
global.indexedDB = {
  deleteDatabase: vi.fn().mockImplementation(() => {
    const request = {
      onsuccess: null as any,
      onerror: null as any
    }
    // Simulate async success
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess()
    }, 0)
    return request
  })
} as any

import {
  WHISPER_MODELS,
  generateSRT,
  downloadSRT,
  getCacheInfo,
  clearModelCache,
  isWhisperLoaded,
  getCurrentModelName,
  cleanupWhisper
} from '../src/utils/whisper'

describe('Whisper Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanupWhisper()
  })

  describe('Model Configuration', () => {
    it('should have predefined Whisper models', () => {
      expect(WHISPER_MODELS).toBeDefined()
      expect(WHISPER_MODELS.length).toBeGreaterThan(0)
      
      const firstModel = WHISPER_MODELS[0]
      expect(firstModel).toHaveProperty('name')
      expect(firstModel).toHaveProperty('displayName')
      expect(firstModel).toHaveProperty('size')
      expect(firstModel).toHaveProperty('description')
    })

    it('should include both English and multilingual models', () => {
      const englishModels = WHISPER_MODELS.filter(m => m.name.includes('.en'))
      const multilingualModels = WHISPER_MODELS.filter(m => !m.name.includes('.en'))
      
      expect(englishModels.length).toBeGreaterThan(0)
      expect(multilingualModels.length).toBeGreaterThan(0)
    })
  })

  describe('generateSRT', () => {
    it('should generate valid SRT format', () => {
      const transcriptionResult = {
        text: 'Hello world. This is a test.',
        chunks: [
          { text: 'Hello world.', timestamp: [0, 2.5] },
          { text: 'This is a test.', timestamp: [2.5, 5.0] }
        ]
      }
      
      const srt = generateSRT(transcriptionResult)
      
      expect(srt).toContain('1\n00:00:00,000 --> 00:00:02,500\nHello world.')
      expect(srt).toContain('2\n00:00:02,500 --> 00:00:05,000\nThis is a test.')
    })

    it('should handle empty transcription', () => {
      const transcriptionResult = {
        text: '',
        chunks: []
      }
      
      const srt = generateSRT(transcriptionResult)
      expect(srt).toBe('')
    })

    it('should filter out empty text chunks', () => {
      const transcriptionResult = {
        text: 'Hello world.',
        chunks: [
          { text: 'Hello world.', timestamp: [0, 2.5] },
          { text: '', timestamp: [2.5, 3.0] },
          { text: '   ', timestamp: [3.0, 3.5] }
        ]
      }
      
      const srt = generateSRT(transcriptionResult)
      const lines = srt.split('\n').filter(line => line.trim())
      
      // Should only have 3 lines for one subtitle (index, timestamp, text)
      expect(lines.length).toBe(3)
    })
  })

  describe('downloadSRT', () => {
    it('should trigger SRT file download', () => {
      const srtContent = '1\n00:00:00,000 --> 00:00:02,500\nHello world.'
      const filename = 'test.srt'
      
      downloadSRT(srtContent, filename)
      
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('Cache Management', () => {
    it('should get cache information', async () => {
      const cacheInfo = await getCacheInfo()
      
      expect(cacheInfo).toHaveProperty('totalSize')
      expect(cacheInfo).toHaveProperty('modelCount')
      expect(cacheInfo).toHaveProperty('models')
      expect(typeof cacheInfo.totalSize).toBe('number')
    })

    it('should clear model cache', async () => {
      // Mock the promise resolution immediately
      global.caches.keys = vi.fn().mockResolvedValue(['transformers-cache'])
      global.caches.delete = vi.fn().mockResolvedValue(true)
      
      await clearModelCache()
      
      expect(global.caches.keys).toHaveBeenCalled()
      expect(global.caches.delete).toHaveBeenCalled()
      expect(isWhisperLoaded()).toBe(false)
      expect(getCurrentModelName()).toBeNull()
    })
  })

  describe('Utility Functions', () => {
    it('should check if Whisper is loaded', () => {
      expect(isWhisperLoaded()).toBe(false)
    })

    it('should get current model name', () => {
      expect(getCurrentModelName()).toBeNull()
    })

    it('should cleanup Whisper resources', () => {
      cleanupWhisper()
      
      expect(isWhisperLoaded()).toBe(false)
      expect(getCurrentModelName()).toBeNull()
    })
  })
})