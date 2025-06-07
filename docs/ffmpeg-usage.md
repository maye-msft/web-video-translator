# FFmpeg WebAssembly Usage Guide

## Overview

This document provides guidance on using FFmpeg WebAssembly (WASM) in the Web Video Translator application for audio extraction and video processing.

## Architecture

### FFmpeg Utility Module (`src/utils/ffmpeg.ts`)

The FFmpeg utility module provides a clean API for WebAssembly operations:

- **Singleton Pattern**: Uses a single FFmpeg instance across the application
- **Progress Tracking**: Real-time progress updates for long-running operations
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Memory Management**: Proper cleanup and file system management

### Key Functions

#### `initializeFFmpeg(onProgress?, onLog?)`
- Initializes FFmpeg WebAssembly with CORS configuration
- Sets up logging and progress tracking callbacks
- Returns Promise<FFmpeg> instance
- Only initializes once (singleton pattern)

#### `extractAudio(videoFile, outputFormat, onProgress?)`
- Extracts audio from video files
- Supports WAV (uncompressed) and MP3 (compressed) formats
- Provides progress callbacks for UI feedback
- Automatically cleans up temporary files

#### `downloadFile(data, filename, mimeType)`
- Triggers browser download for generated files
- Creates blob URLs and handles cleanup
- Supports any binary data format

## Memory Considerations

### Large File Handling

1. **File Size Limits**: 
   - Recommended maximum: 500MB per video file
   - Browser memory constraints apply
   - Consider chunked processing for larger files

2. **Memory Cleanup**:
   - FFmpeg file system is cleaned after each operation
   - Temporary files are deleted automatically
   - Use `cleanupFFmpeg()` for complete instance cleanup

3. **Performance Optimization**:
   - Process files sequentially to avoid memory pressure
   - Monitor browser memory usage during development
   - Consider Web Workers for heavy processing (future enhancement)

### Best Practices

```typescript
// Good: Initialize once, use multiple times
const ffmpeg = await initializeFFmpeg();
await extractAudio(file1, 'wav');
await extractAudio(file2, 'mp3');

// Good: Proper error handling
try {
  const audioData = await extractAudio(videoFile, 'wav', (progress) => {
    console.log(`Progress: ${progress}%`);
  });
  downloadFile(audioData, 'audio.wav', 'audio/wav');
} catch (error) {
  console.error('Audio extraction failed:', error);
}

// Good: Check initialization status
if (isFFmpegLoaded()) {
  // Safe to use FFmpeg operations
}
```

## CORS and WebAssembly Loading

### Configuration

The FFmpeg core is loaded from unpkg.com CDN:
- Core JS: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js`
- WebAssembly: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm`

### Cross-Origin Headers

Vite development server is configured with required headers:
```javascript
headers: {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin'
}
```

## Error Handling

### Common Error Scenarios

1. **Initialization Failures**:
   - Network connectivity issues
   - CORS policy violations
   - WebAssembly not supported

2. **Processing Failures**:
   - Unsupported video formats
   - Corrupted input files
   - Insufficient browser memory

3. **File System Errors**:
   - Write permission issues
   - Disk space limitations

### Error Recovery

```typescript
// Retry initialization with exponential backoff
async function initializeWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await initializeFFmpeg();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## Testing Strategy

### Unit Tests (`tests/ffmpeg.test.ts`)

- Mock FFmpeg dependencies for isolated testing
- Test error conditions and edge cases
- Verify proper cleanup and memory management
- Test progress callbacks and logging

### Integration Testing

Use the FFmpeg Test page (`/ffmpeg-test`) for:
- Real WebAssembly loading verification
- Audio extraction with various formats
- Progress tracking validation
- Error handling verification

## Performance Monitoring

### Metrics to Track

1. **Initialization Time**: WebAssembly loading duration
2. **Processing Speed**: Audio extraction time vs. video duration
3. **Memory Usage**: Peak memory consumption during operations
4. **Error Rates**: Initialization and processing failure rates

### Debugging

Enable detailed logging:
```typescript
await initializeFFmpeg(
  (progress) => console.log(`Progress: ${progress}%`),
  (message) => console.log(`FFmpeg: ${message}`)
);
```

## Future Enhancements

### Planned Improvements

1. **Web Workers**: Move FFmpeg processing to background threads
2. **Streaming**: Support for larger files with streaming processing
3. **Codec Support**: Additional audio/video format support
4. **Progress Optimization**: More granular progress reporting
5. **Caching**: Cache FFmpeg core for faster subsequent loads

### Subtitle Extraction Integration

The FFmpeg infrastructure established here will support:
- Subtitle stream extraction from video files
- SRT format generation and parsing
- Timeline synchronization
- Multiple subtitle track handling

## Troubleshooting

### Common Issues

1. **"FFmpeg is not initialized"**:
   - Call `initializeFFmpeg()` before processing
   - Check for initialization errors

2. **CORS errors**:
   - Verify server headers configuration
   - Check browser security policies

3. **Memory errors**:
   - Reduce file sizes
   - Process files sequentially
   - Call `cleanupFFmpeg()` between operations

4. **Slow performance**:
   - Check network connectivity for WASM loading
   - Monitor browser performance tab
   - Consider reducing output quality settings