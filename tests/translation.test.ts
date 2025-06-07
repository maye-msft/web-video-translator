// Unit tests for MarianMT translation functionality
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  SUPPORTED_LANGUAGES,
  MARIAN_MODELS,
  parseSRT,
  generateTranslatedSRT,
  formatFileSize,
  findModelsForLanguagePair,
  getTranslationCacheInfo,
  clearTranslationCache,
  type SubtitleSegment,
} from '../src/utils/translation'

// Mock browser APIs
const mockCacheStorage = {
  keys: vi.fn(),
  match: vi.fn(),
  delete: vi.fn(),
}

const mockCaches = {
  open: vi.fn().mockResolvedValue(mockCacheStorage),
  delete: vi.fn().mockResolvedValue(true),
}

Object.defineProperty(window, 'caches', {
  value: mockCaches,
  writable: true,
})

describe('Translation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset mock implementations
    mockCaches.open.mockResolvedValue(mockCacheStorage)
    mockCaches.delete.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Language Support', () => {
    it('should have defined supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toBeDefined()
      expect(Object.keys(SUPPORTED_LANGUAGES).length).toBeGreaterThan(0)
      expect(SUPPORTED_LANGUAGES.en).toBe('English')
      expect(SUPPORTED_LANGUAGES.es).toBe('Spanish')
      expect(SUPPORTED_LANGUAGES.fr).toBe('French')
    })

    it('should have MarianMT models defined', () => {
      expect(MARIAN_MODELS).toBeDefined()
      expect(MARIAN_MODELS.length).toBeGreaterThan(0)

      // Check structure of first model
      const firstModel = MARIAN_MODELS[0]
      expect(firstModel).toHaveProperty('id')
      expect(firstModel).toHaveProperty('name')
      expect(firstModel).toHaveProperty('sourceLanguage')
      expect(firstModel).toHaveProperty('targetLanguage')
      expect(firstModel).toHaveProperty('size')
      expect(firstModel).toHaveProperty('description')
    })
  })

  describe('SRT Parsing', () => {
    it('should parse valid SRT content correctly', () => {
      const srtContent = `1
00:00:01,000 --> 00:00:04,000
Hello world!

2
00:00:05,500 --> 00:00:08,200
This is a test subtitle.

3
00:00:10,000 --> 00:00:12,500
Multi-line subtitle
with two lines.`

      const segments = parseSRT(srtContent)

      expect(segments).toHaveLength(3)

      expect(segments[0]).toEqual({
        index: 1,
        startTime: '00:00:01,000',
        endTime: '00:00:04,000',
        text: 'Hello world!',
        timestamp: [1, 4],
      })

      expect(segments[1]).toEqual({
        index: 2,
        startTime: '00:00:05,500',
        endTime: '00:00:08,200',
        text: 'This is a test subtitle.',
        timestamp: [5.5, 8.2],
      })

      expect(segments[2]).toEqual({
        index: 3,
        startTime: '00:00:10,000',
        endTime: '00:00:12,500',
        text: 'Multi-line subtitle\nwith two lines.',
        timestamp: [10, 12.5],
      })
    })

    it('should handle empty or invalid SRT content', () => {
      expect(parseSRT('')).toEqual([])
      expect(parseSRT('invalid content')).toEqual([])
      expect(parseSRT('1\ninvalid timestamp\ntext')).toEqual([])
    })

    it('should handle malformed entries gracefully', () => {
      const srtContent = `1
00:00:01,000 --> 00:00:04,000
Valid entry

invalid entry

2
00:00:05,000 --> 00:00:08,000
Another valid entry`

      const segments = parseSRT(srtContent)
      expect(segments).toHaveLength(2)
      expect(segments[0].text).toBe('Valid entry')
      expect(segments[1].text).toBe('Another valid entry')
    })
  })

  describe('SRT Generation', () => {
    it('should generate translated SRT correctly', () => {
      const originalSegments: SubtitleSegment[] = [
        {
          index: 1,
          startTime: '00:00:01,000',
          endTime: '00:00:04,000',
          text: 'Hello world!',
          timestamp: [1, 4],
        },
        {
          index: 2,
          startTime: '00:00:05,500',
          endTime: '00:00:08,200',
          text: 'This is a test.',
          timestamp: [5.5, 8.2],
        },
      ]

      const translatedTexts = ['¡Hola mundo!', 'Esta es una prueba.']

      const result = generateTranslatedSRT(originalSegments, translatedTexts)

      const expectedSRT = `1
00:00:01,000 --> 00:00:04,000
¡Hola mundo!

2
00:00:05,500 --> 00:00:08,200
Esta es una prueba.
`

      expect(result).toBe(expectedSRT)
    })

    it('should handle mismatched segment and translation counts', () => {
      const segments: SubtitleSegment[] = [
        {
          index: 1,
          startTime: '00:00:01,000',
          endTime: '00:00:04,000',
          text: 'Hello',
          timestamp: [1, 4],
        },
      ]

      const translations = ['Hola', 'Extra translation']

      // Should throw error for mismatched counts
      expect(() => generateTranslatedSRT(segments, translations)).toThrow(
        'Mismatch between original segments and translated texts'
      )
    })
  })

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(1536)).toBe('1.50 KB')
      expect(formatFileSize(1048576)).toBe('1.00 MB')
      expect(formatFileSize(1073741824)).toBe('1.00 GB')
      expect(formatFileSize(1099511627776)).toBe('1.00 TB')
    })

    it('should handle zero and negative values', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(-1)).toBe('0 B')
    })
  })

  describe('Model Finding', () => {
    it('should find models for language pairs', () => {
      const enToEs = findModelsForLanguagePair('en', 'es')
      expect(enToEs.length).toBeGreaterThan(0)
      expect(enToEs[0].sourceLanguage).toBe('en')
      expect(enToEs[0].targetLanguage).toBe('es')

      const esToEn = findModelsForLanguagePair('es', 'en')
      expect(esToEn.length).toBeGreaterThan(0)
      expect(esToEn[0].sourceLanguage).toBe('es')
      expect(esToEn[0].targetLanguage).toBe('en')
    })

    it('should return empty array for unsupported language pairs', () => {
      // Use valid language codes but an unsupported pair
      const result = findModelsForLanguagePair('ar', 'hi')
      expect(result).toEqual([])
    })

    it('should handle multilingual models', () => {
      const models = findModelsForLanguagePair('en', 'ja')
      expect(models.length).toBeGreaterThan(0)

      // Should find the multilingual model (opus-mt-en-mul supports multiple target languages)
      const multilingualModel = models.find(m => m.id.includes('mul'))
      expect(multilingualModel).toBeDefined()
      expect(multilingualModel?.targetLanguage).toBe('mul')
    })
  })

  describe('Cache Management', () => {
    it('should get cache info successfully', async () => {
      // Mock cache responses with the correct URL patterns
      mockCacheStorage.keys.mockResolvedValue([
        { url: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.0/dist/ort-wasm-simd.wasm' },
        { url: 'https://huggingface.co/models/Xenova--opus-mt-en-es/resolve/main/onnx/encoder_model.onnx' },
      ])

      mockCacheStorage.match.mockImplementation(request => {
        if (request.url.includes('ort-wasm-simd.wasm')) {
          return Promise.resolve({
            headers: new Headers({ 'content-length': '1048576' }),
          })
        }
        if (request.url.includes('encoder_model.onnx')) {
          return Promise.resolve({
            headers: new Headers({ 'content-length': '52428800' }),
          })
        }
        return Promise.resolve(null)
      })

      const cacheInfo = await getTranslationCacheInfo()

      expect(cacheInfo.totalSize).toBeGreaterThan(0)
      expect(cacheInfo.modelCount).toBe(1) // Only one model (opus-mt-en-es)
      expect(cacheInfo.models).toHaveLength(1)
      expect(cacheInfo.models[0].modelId).toContain('opus-mt-en-es')
    })

    it('should return empty cache info when caches API not available', async () => {
      // Temporarily remove caches from window
      const originalCaches = (window as any).caches
      ;(window as any).caches = undefined

      const cacheInfo = await getTranslationCacheInfo()

      expect(cacheInfo).toEqual({
        totalSize: 0,
        modelCount: 0,
        models: [],
      })

      // Restore original caches
      ;(window as any).caches = originalCaches
    })

    it('should clear translation cache successfully', async () => {
      mockCaches.delete.mockResolvedValue(true)

      await clearTranslationCache()

      expect(mockCaches.delete).toHaveBeenCalledWith('transformers-cache')
    })

    it('should handle cache clearing errors', async () => {
      mockCaches.delete.mockRejectedValue(new Error('Cache delete failed'))

      await expect(clearTranslationCache()).rejects.toThrow(
        'Cache delete failed'
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed SRT timestamps', () => {
      const badSRT = `1
invalid --> timestamp
Some text`

      const segments = parseSRT(badSRT)
      expect(segments).toEqual([])
    })

    it('should handle missing SRT components', () => {
      const incompleteSRT = `1
00:00:01,000 --> 00:00:04,000`

      const segments = parseSRT(incompleteSRT)
      expect(segments).toEqual([])
    })
  })
})
