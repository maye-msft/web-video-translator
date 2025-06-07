// Web Worker for MarianMT Translation processing to avoid blocking the main thread
import { pipeline, TranslationPipeline, env } from '@xenova/transformers'

// Configure Transformer.js to use remote models
env.allowRemoteModels = true
env.allowLocalModels = false
env.useBrowserCache = true
env.remoteHost = 'https://huggingface.co'
env.remotePathTemplate = '{model}/resolve/main/'

// Worker state
let translationPipeline: TranslationPipeline | null = null
let currentModelId: string | null = null

// Message types
interface InitializeMessage {
  type: 'initialize'
  modelId: string
  requestId: string
}

interface TranslateMessage {
  type: 'translate'
  texts: string[]
  options: {
    sourceLanguage?: string
    targetLanguage?: string
    maxLength?: number
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
  | TranslateMessage
  | CancelMessage
  | CleanupMessage

// Track active requests for cancellation
const activeRequests = new Set<string>()

// Language prefix mapping for multi-language models
// Based on the supported language codes from the model
function getLanguagePrefix(targetLanguage: string): string {
  const prefixMap: Record<string, string> = {
    // Chinese variants
    zh: '>>cmn_Hans<<',
    'zh-cn': '>>cmn_Hans<<',
    'zh-tw': '>>zho_Hant<<',

    // Major European languages
    es: '>>spa<<',
    fr: '>>fra<<',
    de: '>>deu<<',
    it: '>>ita<<',
    pt: '>>por<<',
    ru: '>>rus<<',
    nl: '>>nld<<',
    pl: '>>pol<<',
    sv: '>>swe<<',
    da: '>>dan<<',
    no: '>>nno<<',
    fi: '>>fin<<',
    cs: '>>ces<<',
    hu: '>>hun<<',
    ro: '>>ron<<',
    bg: '>>bul<<',
    hr: '>>hrv<<',
    sk: '>>slk<<',
    sl: '>>slv<<',
    et: '>>est<<',
    lv: '>>lav<<',

    // Asian languages
    ja: '>>jpn<<',
    ko: '>>kor<<',
    hi: '>>hin<<',
    th: '>>tha<<',
    vi: '>>vie<<',

    // Arabic
    ar: '>>ara<<',

    // Other languages based on the model's supported codes
    lt: '>>lit<<',
    ca: '>>cat<<',
    eu: '>>eus<<',
    gl: '>>glg<<',
    mt: '>>mlt<<',
    ga: '>>gle<<',
    cy: '>>cym<<',
    is: '>>isl<<',
    mk: '>>mkd<<',
    sq: '>>sqi<<',
    be: '>>bel<<',
    uk: '>>ukr<<',
    ka: '>>kat<<',
    hy: '>>hye<<',
    he: '>>heb<<',
    ur: '>>urd<<',
    fa: '>>pes<<',
    bn: '>>ben<<',
    ta: '>>tam<<',
    te: '>>tel<<',
    ml: '>>mal<<',
    kn: '>>kan<<',
    gu: '>>guj<<',
    or: '>>ori<<',
    pa: '>>pan<<',
    as: '>>asm<<',
    my: '>>mya<<',
    km: '>>khm<<',
    lo: '>>lao<<',
    si: '>>sin<<',
    ne: '>>nep<<',
    id: '>>ind<<',
    ms: '>>msa<<',
    tl: '>>tgl<<',
    sw: '>>swa<<',
    zu: '>>zul<<',
    xh: '>>xho<<',
    af: '>>afr<<',
    am: '>>amh<<',
    yo: '>>yor<<',
    ig: '>>ibo<<',
    ha: '>>hau<<',
  }
  return prefixMap[targetLanguage.toLowerCase()] || ''
}

// Initialize MarianMT model
async function initializeModel(modelId: string, requestId: string) {
  try {
    if (translationPipeline && currentModelId === modelId) {
      self.postMessage({
        type: 'initialize-success',
        requestId,
        modelId,
      })
      return
    }

    // Clear existing pipeline if switching models
    if (translationPipeline && currentModelId !== modelId) {
      translationPipeline = null
      currentModelId = null
    }

    // Set up progress tracking for model download
    const progressCallback = (data: any) => {
      if (data.status === 'progress' && activeRequests.has(requestId)) {
        self.postMessage({
          type: 'model-progress',
          requestId,
          progress: {
            progress: data.progress || 0,
            loaded: data.loaded || 0,
            total: data.total || 0,
          },
        })
      }
    }

    // Initialize the translation pipeline with progress tracking
    translationPipeline = await pipeline('translation', modelId, {
      progress_callback: progressCallback,
      quantized: true,
    })

    currentModelId = modelId

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'initialize-success',
        requestId,
        modelId,
      })
    }
  } catch (error) {
    translationPipeline = null
    currentModelId = null

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'error',
        requestId,
        error: `Failed to initialize translation model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }
}

// Translate texts
async function translateTexts(
  texts: string[],
  options: any,
  requestId: string
) {
  if (!translationPipeline) {
    self.postMessage({
      type: 'error',
      requestId,
      error: 'Translation model is not initialized',
    })
    return
  }

  let progressInterval: NodeJS.Timeout | null = null

  try {
    const { sourceLanguage, targetLanguage, maxLength = 512 } = options

    console.log('Translation worker starting with:', {
      modelId: currentModelId,
      sourceLanguage,
      targetLanguage,
      textCount: texts.length,
      firstText: texts[0]?.substring(0, 100) + '...',
      options,
    })

    // Progress simulation with guaranteed increments
    let progress = 5
    const totalTexts = texts.length

    // Send initial progress
    console.log('Translation worker sending initial progress:', progress)
    self.postMessage({
      type: 'translation-progress',
      requestId,
      progress,
    })

    // Use fixed increment that guarantees visible progress
    const progressIncrement = 2 // 2% every 250ms = steady progress

    console.log('Translation progress setup:', {
      totalTexts,
      increment: progressIncrement,
      intervalMs: 250,
    })

    // Create progress interval that increments gradually
    progressInterval = setInterval(() => {
      console.log(
        'Translation progress interval tick - activeRequests:',
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
          'Translation request cancelled or not found, stopping progress interval for:',
          requestId
        )
        if (progressInterval) clearInterval(progressInterval)
        return
      }

      progress += progressIncrement
      progress = Math.min(progress, 85) // Leave room for final steps

      console.log(
        'Translation worker sending progress:',
        Math.round(progress),
        'for request:',
        requestId
      )
      self.postMessage({
        type: 'translation-progress',
        requestId,
        progress: Math.round(progress),
      })
    }, 250) // More frequent updates (every 250ms)

    // Process texts in batches to avoid memory issues
    const batchSize = Math.min(10, Math.max(1, Math.floor(100 / texts.length)))
    const translatedTexts: string[] = []

    for (let i = 0; i < texts.length; i += batchSize) {
      if (!activeRequests.has(requestId)) {
        return // Request was cancelled
      }

      const batch = texts.slice(i, i + batchSize)

      try {
        // Translate the batch
        console.log('Translating batch:', {
          batchSize: batch.length,
          firstText: batch[0]?.substring(0, 50) + '...',
          modelId: currentModelId,
          targetLanguage: targetLanguage,
        })

        // For multi-language models, we need to handle target language specification
        let inputTexts = batch
        if (currentModelId?.includes('en-mul') && targetLanguage) {
          // Add language prefix for opus-mt-en-mul models
          const langPrefix = getLanguagePrefix(targetLanguage)
          if (langPrefix) {
            inputTexts = batch.map(text => `${langPrefix}${text}`)
            console.log(
              'Added language prefix:',
              langPrefix,
              'to inputs for target language:',
              targetLanguage
            )
          }
        }

        const batchResults = await translationPipeline(inputTexts, {
          max_length: maxLength,
        })

        console.log('Raw translation results:', {
          type: typeof batchResults,
          isArray: Array.isArray(batchResults),
          length: Array.isArray(batchResults) ? batchResults.length : 1,
          firstResult: Array.isArray(batchResults)
            ? batchResults[0]
            : batchResults,
        })

        // Extract translated text from results
        const batchTranslations = Array.isArray(batchResults)
          ? batchResults.map(result =>
              typeof result === 'object' &&
              result !== null &&
              'translation_text' in result
                ? (result as any).translation_text
                : String(result)
            )
          : [
              typeof batchResults === 'object' &&
              batchResults !== null &&
              'translation_text' in batchResults
                ? (batchResults as any).translation_text
                : String(batchResults),
            ]

        console.log('Extracted translations:', {
          originalBatch: batch,
          translatedBatch: batchTranslations,
        })

        translatedTexts.push(...batchTranslations)
      } catch (batchError) {
        console.error('Batch translation failed:', batchError)
        // Add original text as fallback for failed translations
        translatedTexts.push(...batch)
      }
    }

    // Clear the progress interval before final processing
    if (progressInterval) {
      clearInterval(progressInterval)
    }

    if (!activeRequests.has(requestId)) {
      return // Request was cancelled
    }

    // Update progress to show we're finalizing
    console.log('Translation worker sending progress: 90 (finalizing)')
    self.postMessage({
      type: 'translation-progress',
      requestId,
      progress: 90,
    })

    // Ensure we have the same number of translations as original texts
    while (translatedTexts.length < texts.length) {
      translatedTexts.push(texts[translatedTexts.length] || '')
    }

    // Final progress update
    console.log('Translation worker sending progress: 100 (complete)')
    self.postMessage({
      type: 'translation-progress',
      requestId,
      progress: 100,
    })

    console.log('Final translation result:', {
      originalCount: texts.length,
      translatedCount: translatedTexts.length,
      firstOriginal: texts[0]?.substring(0, 100),
      firstTranslated: translatedTexts[0]?.substring(0, 100),
      modelUsed: currentModelId,
      sourceLanguage,
      targetLanguage,
    })

    // Send successful result
    self.postMessage({
      type: 'translate-success',
      requestId,
      result: {
        originalTexts: texts,
        translatedTexts,
        sourceLanguage,
        targetLanguage,
        modelUsed: currentModelId || 'unknown',
      },
    })
  } catch (error) {
    // Clean up progress interval on error
    if (progressInterval) {
      clearInterval(progressInterval)
    }

    if (activeRequests.has(requestId)) {
      self.postMessage({
        type: 'error',
        requestId,
        error: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  } finally {
    // Always clean up the request from activeRequests at the very end
    activeRequests.delete(requestId)
    console.log(
      'Cleaned up translation request from activeRequests:',
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
    const { modelId, requestId } = event.data as InitializeMessage
    activeRequests.add(requestId)
    await initializeModel(modelId, requestId)
    activeRequests.delete(requestId)
  } else if (type === 'translate') {
    const { texts, options, requestId } = event.data as TranslateMessage
    activeRequests.add(requestId)
    console.log(
      'Added translation request to activeRequests:',
      requestId,
      'Current set:',
      Array.from(activeRequests)
    )
    // Start translation - don't use await to prevent early cleanup
    translateTexts(texts, options, requestId)
  } else if (type === 'cancel') {
    const { requestId } = event.data as CancelMessage
    activeRequests.delete(requestId)
    self.postMessage({
      type: 'cancelled',
      requestId,
    })
  } else if (type === 'cleanup') {
    activeRequests.clear()
    translationPipeline = null
    currentModelId = null
  }
}

// Export empty object to make this a module
export {}
