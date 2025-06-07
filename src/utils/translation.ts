// MarianMT Translation utilities for subtitle translation
// Note: pipeline and TranslationPipeline imports are used by components that import this module

// Common language codes and names
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  th: 'Thai',
  vi: 'Vietnamese',
  pl: 'Polish',
  cs: 'Czech',
  sk: 'Slovak',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sl: 'Slovenian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  fi: 'Finnish',
  sv: 'Swedish',
  da: 'Danish',
  no: 'Norwegian',
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

// Available MarianMT models for translation
export const MARIAN_MODELS = [
  // European languages
  {
    id: 'Xenova/opus-mt-en-es',
    name: 'English to Spanish',
    sourceLanguage: 'en' as LanguageCode,
    targetLanguage: 'es' as LanguageCode,
    size: '~220MB',
    description: 'High-quality English to Spanish translation',
  },
  {
    id: 'Xenova/opus-mt-es-en',
    name: 'Spanish to English',
    sourceLanguage: 'es' as LanguageCode,
    targetLanguage: 'en' as LanguageCode,
    size: '~220MB',
    description: 'High-quality Spanish to English translation',
  },
  {
    id: 'Xenova/opus-mt-en-fr',
    name: 'English to French',
    sourceLanguage: 'en' as LanguageCode,
    targetLanguage: 'fr' as LanguageCode,
    size: '~220MB',
    description: 'High-quality English to French translation',
  },
  {
    id: 'Xenova/opus-mt-fr-en',
    name: 'French to English',
    sourceLanguage: 'fr' as LanguageCode,
    targetLanguage: 'en' as LanguageCode,
    size: '~220MB',
    description: 'High-quality French to English translation',
  },
  {
    id: 'Xenova/opus-mt-en-de',
    name: 'English to German',
    sourceLanguage: 'en' as LanguageCode,
    targetLanguage: 'de' as LanguageCode,
    size: '~220MB',
    description: 'High-quality English to German translation',
  },
  {
    id: 'Xenova/opus-mt-de-en',
    name: 'German to English',
    sourceLanguage: 'de' as LanguageCode,
    targetLanguage: 'en' as LanguageCode,
    size: '~220MB',
    description: 'High-quality German to English translation',
  },
  {
    id: 'Xenova/opus-mt-en-it',
    name: 'English to Italian',
    sourceLanguage: 'en' as LanguageCode,
    targetLanguage: 'it' as LanguageCode,
    size: '~220MB',
    description: 'High-quality English to Italian translation',
  },
  {
    id: 'Xenova/opus-mt-it-en',
    name: 'Italian to English',
    sourceLanguage: 'it' as LanguageCode,
    targetLanguage: 'en' as LanguageCode,
    size: '~220MB',
    description: 'High-quality Italian to English translation',
  },
  {
    id: 'Xenova/opus-mt-en-ru',
    name: 'English to Russian',
    sourceLanguage: 'en' as LanguageCode,
    targetLanguage: 'ru' as LanguageCode,
    size: '~220MB',
    description: 'High-quality English to Russian translation',
  },
  {
    id: 'Xenova/opus-mt-ru-en',
    name: 'Russian to English',
    sourceLanguage: 'ru' as LanguageCode,
    targetLanguage: 'en' as LanguageCode,
    size: '~220MB',
    description: 'High-quality Russian to English translation',
  },
  // Multi-language models
  {
    id: 'Xenova/opus-mt-en-mul',
    name: 'English to Multiple Languages',
    sourceLanguage: 'en' as LanguageCode,
    targetLanguage: 'mul' as any,
    size: '~500MB',
    description:
      'English to multiple target languages (supports 50+ languages)',
  },
  {
    id: 'Xenova/opus-mt-mul-en',
    name: 'Multiple Languages to English',
    sourceLanguage: 'mul' as any,
    targetLanguage: 'en' as LanguageCode,
    size: '~500MB',
    description:
      'Multiple source languages to English (supports 50+ languages)',
  },
] as const

export type MarianModel = (typeof MARIAN_MODELS)[number]

// Translation progress callback type
export type TranslationProgressCallback = (progress: number) => void

// Translation result interface
export interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: LanguageCode | 'mul'
  targetLanguage: LanguageCode | 'mul'
  modelUsed: string
  segments?: Array<{
    original: string
    translated: string
    timestamp?: [number, number]
  }>
}

// SRT subtitle segment interface
export interface SubtitleSegment {
  index: number
  startTime: string
  endTime: string
  text: string
  timestamp: [number, number]
}

// Cache information interface
export interface TranslationCacheInfo {
  totalSize: number
  modelCount: number
  models: Array<{
    modelId: string
    size: number
    lastUsed: Date
  }>
}

// Parse SRT content into segments
export function parseSRT(srtContent: string): SubtitleSegment[] {
  const segments: SubtitleSegment[] = []
  const blocks = srtContent.trim().split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue

    const index = parseInt(lines[0])
    const timeMatch = lines[1].match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
    )

    if (!timeMatch || isNaN(index)) continue

    const startTime = timeMatch[1]
    const endTime = timeMatch[2]
    const text = lines.slice(2).join('\n')

    // Convert time to seconds for timestamp
    const parseTime = (timeStr: string): number => {
      const [time, ms] = timeStr.split(',')
      const [hours, minutes, seconds] = time.split(':').map(Number)
      return hours * 3600 + minutes * 60 + seconds + parseInt(ms) / 1000
    }

    segments.push({
      index,
      startTime,
      endTime,
      text,
      timestamp: [parseTime(startTime), parseTime(endTime)],
    })
  }

  return segments
}

// Generate SRT content from translated segments
export function generateTranslatedSRT(
  originalSegments: SubtitleSegment[],
  translatedTexts: string[]
): string {
  if (originalSegments.length !== translatedTexts.length) {
    throw new Error('Mismatch between original segments and translated texts')
  }

  return (
    originalSegments
      .map((segment, index) => {
        const translatedText = translatedTexts[index] || segment.text
        return `${segment.index}\n${segment.startTime} --> ${segment.endTime}\n${translatedText}`
      })
      .join('\n\n') + '\n'
  )
}

// Get cache information for translation models
export async function getTranslationCacheInfo(): Promise<TranslationCacheInfo> {
  try {
    if (!('caches' in window)) {
      return { totalSize: 0, modelCount: 0, models: [] }
    }

    const cache = await caches.open('transformers-cache')
    const keys = await cache.keys()

    let totalSize = 0
    const models: TranslationCacheInfo['models'] = []

    for (const request of keys) {
      const response = await cache.match(request)
      if (response) {
        const size = parseInt(response.headers.get('content-length') || '0')
        totalSize += size

        // Extract model info from URL
        const url = request.url
        const modelMatch = url.match(/models\/([^\/]+\/[^\/]+)/)
        if (modelMatch) {
          const modelId = modelMatch[1].replace(/--/g, '/')
          models.push({
            modelId,
            size,
            lastUsed: new Date(), // Approximate - could be improved with IndexedDB tracking
          })
        }
      }
    }

    return {
      totalSize,
      modelCount: models.length,
      models,
    }
  } catch (error) {
    console.error('Failed to get translation cache info:', error)
    return { totalSize: 0, modelCount: 0, models: [] }
  }
}

// Clear translation model cache
export async function clearTranslationCache(): Promise<void> {
  try {
    if ('caches' in window) {
      await caches.delete('transformers-cache')
    }
  } catch (error) {
    console.error('Failed to clear translation cache:', error)
    throw error
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0 || bytes < 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  )

  // For bytes, don't show decimals
  if (i === 0) {
    return bytes + ' ' + sizes[i]
  }

  const size = (bytes / Math.pow(k, i)).toFixed(2)
  return size + ' ' + sizes[i]
}

// Download translated SRT file
export function downloadTranslatedSRT(
  content: string,
  filename: string = 'translated-subtitles.srt'
): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// Find compatible models for language pair
export function findModelsForLanguagePair(
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode
): MarianModel[] {
  return MARIAN_MODELS.filter(model => {
    // Exact match
    if (
      model.sourceLanguage === sourceLanguage &&
      model.targetLanguage === targetLanguage
    ) {
      return true
    }

    // Multi-language models
    if (model.sourceLanguage === 'mul' && targetLanguage === 'en') {
      return true
    }
    if (model.targetLanguage === 'mul' && sourceLanguage === 'en') {
      return true
    }

    return false
  })
}
