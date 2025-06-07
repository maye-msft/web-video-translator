# MarianMT Subtitle Translation Usage Guide

## Overview

The MarianMT translation system provides browser-based machine translation for subtitle files using the Transformer.js library. It supports 12 language pairs with high-quality neural machine translation models.

## Supported Language Pairs

### Available Models

| Model Name                    | Source → Target      | Model Size | Description                                                   |
| ----------------------------- | -------------------- | ---------- | ------------------------------------------------------------- |
| `Helsinki-NLP/opus-mt-en-es`  | English → Spanish    | ~298MB     | High-quality EN→ES translation                                |
| `Helsinki-NLP/opus-mt-es-en`  | Spanish → English    | ~298MB     | High-quality ES→EN translation                                |
| `Helsinki-NLP/opus-mt-en-fr`  | English → French     | ~298MB     | High-quality EN→FR translation                                |
| `Helsinki-NLP/opus-mt-fr-en`  | French → English     | ~298MB     | High-quality FR→EN translation                                |
| `Helsinki-NLP/opus-mt-en-de`  | English → German     | ~298MB     | High-quality EN→DE translation                                |
| `Helsinki-NLP/opus-mt-de-en`  | German → English     | ~298MB     | High-quality DE→EN translation                                |
| `Helsinki-NLP/opus-mt-en-it`  | English → Italian    | ~298MB     | High-quality EN→IT translation                                |
| `Helsinki-NLP/opus-mt-it-en`  | Italian → English    | ~298MB     | High-quality IT→EN translation                                |
| `Helsinki-NLP/opus-mt-en-pt`  | English → Portuguese | ~298MB     | High-quality EN→PT translation                                |
| `Helsinki-NLP/opus-mt-pt-en`  | Portuguese → English | ~298MB     | High-quality PT→EN translation                                |
| `Helsinki-NLP/opus-mt-en-mul` | English → Multiple   | ~575MB     | EN to 50+ languages (Chinese, Japanese, Korean, Arabic, etc.) |
| `Helsinki-NLP/opus-mt-mul-en` | Multiple → English   | ~575MB     | 50+ languages to EN (Chinese, Japanese, Korean, Arabic, etc.) |

### Language Prefix Mapping

For multi-language models (`en-mul`, `mul-en`), specific language prefixes are required:

- **Japanese**: `>>jpn<<`
- **Chinese (Simplified)**: `>>cmn_Hans<<`
- **Korean**: `>>kor<<`
- **Arabic**: `>>ara<<`
- **Russian**: `>>rus<<`
- **Dutch**: `>>nld<<`

## Usage Instructions

### 1. Accessing the Translation Interface

Navigate to the MarianMT test page:

```
http://localhost:5178/web-video-translator/translation-test
```

### 2. Input Methods

#### Method A: Paste SRT Content

1. Click on the text area labeled "Paste your SRT content here..."
2. Paste your SRT subtitle content directly
3. The system will automatically parse and validate the format

#### Method B: Upload SRT File

1. Click the "Choose File" button
2. Select an `.srt` file from your local system
3. The file content will be automatically loaded and displayed

### 3. Model Selection

1. Choose your desired language pair from the dropdown menu
2. View model information including:
   - Source and target languages
   - Model size (download requirement)
   - Estimated download time

### 4. Translation Process

1. Click "Translate" to begin the process
2. Monitor progress through two phases:
   - **Model Loading**: Download and cache the translation model
   - **Translation**: Process subtitle segments with real-time progress
3. View results in the output section

### 5. Managing Results

#### Edit Translations

- Click on any translated subtitle segment to edit
- Modify text while preserving timestamps
- Changes are automatically saved

#### Download Results

- Click "Download Translated SRT" to save the file
- File will be saved with `_translated` suffix
- Original formatting and timestamps are preserved

## Cache Management

### Viewing Cache Status

- Cache information is displayed at the bottom of the interface
- Shows total storage usage and number of cached models
- Lists individual cached models with sizes

### Clearing Cache

1. Click "Clear Translation Cache" button
2. Confirm the action in the dialog
3. All cached translation models will be removed
4. Note: This will require re-downloading models for future use

### Storage Considerations

- Each model requires 298MB-575MB of browser storage
- Models are cached permanently until manually cleared
- Multiple models can be cached simultaneously
- Consider clearing cache if storage is limited

## API Usage

### Direct API Access

```typescript
import { translateSRT, MARIAN_MODELS } from '@/utils/translation'

// Translate SRT content
const result = await translateSRT(
  srtContent,
  'Helsinki-NLP/opus-mt-en-es',
  'en',
  'es',
  progress => console.log(`Progress: ${progress}%`)
)

// Generate translated SRT file
const translatedSRT = generateTranslatedSRT(result.chunks)
```

### Service Integration

```typescript
import translationService from '@/services/translationService'

// Initialize translation service
await translationService.initialize()

// Perform translation
const result = await translationService.translateSRT(
  srtContent,
  modelName,
  sourceLang,
  targetLang,
  progressCallback
)
```

## Best Practices

### Model Selection

- Use dedicated language pair models (e.g., `en-es`) for best quality
- Use multi-language models (`en-mul`, `mul-en`) for less common languages
- Consider model size vs. translation frequency trade-offs

### Performance Optimization

- Cache frequently used models locally
- Use web workers for non-blocking translation
- Process subtitles in batches for better performance

### Error Handling

- Always implement progress callbacks for user feedback
- Handle network failures gracefully
- Provide fallback options for unsupported language pairs

### Memory Management

- Clear unused models from cache periodically
- Monitor browser memory usage with large models
- Use efficient batch processing for long subtitle files

## Troubleshooting

### Common Issues

#### Model Download Failures

- **Issue**: Network timeouts during model download
- **Solution**: Retry download, check internet connection
- **Prevention**: Use stable network connection for initial downloads

#### Translation Errors

- **Issue**: Translation fails or produces poor results
- **Solution**: Verify SRT format, try different model, check language codes
- **Prevention**: Validate input format before translation

#### Cache Storage Issues

- **Issue**: Browser storage quota exceeded
- **Solution**: Clear old cached models, use fewer models simultaneously
- **Prevention**: Monitor cache usage regularly

#### Performance Problems

- **Issue**: Slow translation or UI freezing
- **Solution**: Use smaller subtitle files, ensure web workers are functioning
- **Prevention**: Process subtitles in smaller batches

### Error Codes

- **NETWORK_ERROR**: Failed to download model from remote server
- **PARSE_ERROR**: Invalid SRT format in input
- **MODEL_ERROR**: Model initialization or loading failed
- **TRANSLATION_ERROR**: Translation process failed
- **CACHE_ERROR**: Browser cache operation failed

## Integration Examples

### Vue Component Integration

```vue
<template>
  <div>
    <SRTInput @srt-loaded="onSRTLoaded" />
    <TranslationControls :models="availableModels" @translate="onTranslate" />
    <TranslationResults :results="results" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import translationService from '@/services/translationService'

const results = ref(null)

const onTranslate = async (srtContent, modelName, sourceLang, targetLang) => {
  results.value = await translationService.translateSRT(
    srtContent,
    modelName,
    sourceLang,
    targetLang,
    progress => console.log(`Progress: ${progress}%`)
  )
}
</script>
```

### Workflow Integration

```typescript
// Complete subtitle workflow
async function processVideoSubtitles(videoFile: File) {
  // 1. Extract audio from video
  const audioData = await extractAudio(videoFile)

  // 2. Generate subtitles with Whisper
  const transcription = await transcribeAudio(audioData)
  const originalSRT = generateSRT(transcription)

  // 3. Translate subtitles with MarianMT
  const translatedSRT = await translateSRT(
    originalSRT,
    'Helsinki-NLP/opus-mt-en-es',
    'en',
    'es'
  )

  // 4. Return both versions
  return {
    original: originalSRT,
    translated: translatedSRT,
  }
}
```

## Additional Resources

- [MarianMT Documentation](https://marian-nmt.github.io/)
- [Transformer.js Documentation](https://huggingface.co/docs/transformers.js)
- [Helsinki-NLP Models](https://huggingface.co/Helsinki-NLP)
- [SRT Format Specification](https://en.wikipedia.org/wiki/SubRip)
