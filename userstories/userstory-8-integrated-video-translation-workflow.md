# User Story #8: Integrated Video Translation Workflow

## Goal

Create a unified, step-by-step video translation workflow that integrates all existing components (Audio Extraction, Speech-to-Text, Translation, and Subtitle Merge) into a seamless user experience. Users should be able to complete the entire video translation process from start to finish, with the ability to jump into any step in the middle using artifacts from previous steps. The workflow should maintain state between steps and provide clear navigation with contextual wording for each stage.

## Constraints

- Must integrate existing components: FFmpeg audio extraction, Whisper STT, MarianMT translation, and FFmpeg subtitle merge
- Should maintain all existing functionality while providing unified workflow
- Must allow users to start from any step in the workflow (e.g., upload existing SRT files)
- Should preserve artifacts between steps (video file, audio, transcription, translations, styled subtitles)
- Must provide clear step-by-step navigation with "Next" buttons and step indicators
- Should work entirely in the browser without server-side processing
- Must maintain existing performance optimizations and error handling
- Should support the same file size limits and processing strategies as individual components
- Must preserve existing styling customization and preview functionality
- Should provide contextual help and progress tracking throughout the workflow
- Must work with the existing Vue 3 and TypeScript setup
- Should maintain responsive design and accessibility standards

## Actions

### Core Workflow Integration (High Priority)
[ ] Design workflow state management system to preserve artifacts between steps (video file, audio, SRT, translations)
[ ] Remove IndexPage component and redesign navigation for step-based workflow
[ ] Update routing structure to support 4 workflow steps: `/step-1`, `/step-2`, `/step-3`, `/step-4`
[ ] Create workflow navigation component with step indicators, progress tracking, and "Next" buttons
[ ] Implement artifact passing system between steps with validation
[ ] Add ability to start from any step by uploading existing artifacts (audio files, SRT files)
[ ] Update page titles and instructions to be workflow-focused rather than "test page" language

### Step Component Integration (High Priority)
[ ] Adapt existing VideoUpload and FFmpeg components for Step 1: Video Upload & Audio Extraction
[ ] Adapt existing AudioUpload and Whisper components for Step 2: Speech-to-Text Transcription  
[ ] Adapt existing SRTInput and MarianMT components for Step 3: Subtitle Translation
[ ] Adapt existing SubtitleMerge component for Step 4: Subtitle Styling & Video Merge
[ ] Ensure all existing functionality is preserved while integrating into workflow

### State Management & Persistence (Medium Priority)
[ ] Implement localStorage/sessionStorage for workflow state persistence across browser sessions
[ ] Add step validation and prerequisite checking (prevent skipping required steps)
[ ] Create unified error handling and recovery across all workflow steps
[ ] Add workflow restart/reset functionality to start over

### User Experience Enhancements (Medium Priority)
[ ] Add breadcrumb navigation showing current step and completed steps
[ ] Implement artifact download/export at each step for user convenience
[ ] Create contextual help system explaining each step and available options
[ ] Add workflow completion celebration and final output management
[ ] Update existing component wording to be workflow-contextual

### Testing & Documentation (Low Priority)
[ ] Create end-to-end integration tests for complete workflow
[ ] Update documentation for integrated workflow usage patterns
[ ] Test complete workflow with various video types, languages, and user scenarios
[ ] Commit integrated workflow implementation with appropriate git message

## Detailed Step Descriptions

### Step 1: Video Upload and Audio Extraction
- **Page Title**: "Upload Your Video"
- **Purpose**: Upload video file and extract audio for transcription
- **Key Features**:
  - Drag & drop video upload with format validation
  - Video metadata display (duration, resolution, format)
  - Audio extraction with progress tracking
  - Audio preview playback controls
  - Option to upload existing audio file to skip extraction
  - Format selection for extracted audio (WAV/MP3)
- **Artifacts Generated**: Video file, extracted audio file
- **Next Step Conditions**: Valid video uploaded and audio extracted/uploaded

### Step 2: Speech-to-Text Transcription
- **Page Title**: "Generate Subtitles from Audio"
- **Purpose**: Convert audio to text using Whisper STT
- **Key Features**:
  - Audio playback controls with waveform visualization
  - Whisper model selection with download progress
  - Real-time transcription progress with estimated time
  - Live transcription preview as text appears
  - SRT format generation with timing information
  - Manual transcription editing and timing adjustment
  - Option to upload existing SRT file to skip transcription
  - Export transcription as SRT file
- **Artifacts Generated**: Original transcription SRT file
- **Next Step Conditions**: Valid SRT transcription available

### Step 3: Subtitle Translation
- **Page Title**: "Translate Your Subtitles"
- **Purpose**: Translate subtitles using MarianMT
- **Key Features**:
  - Source and target language selection
  - Original and translated subtitle side-by-side preview
  - Real-time translation progress with segment-by-segment updates
  - Manual translation editing and review
  - Translation quality indicators and confidence scores
  - Multiple translation model options
  - Option to upload existing translated SRT file
  - Export translated subtitles as SRT file
  - Translation memory and reuse for similar content
- **Artifacts Generated**: Translated SRT file(s) in target language(s)
- **Next Step Conditions**: Valid translated SRT available

### Step 4: Subtitle Styling and Video Merge
- **Page Title**: "Customize and Merge Subtitles"
- **Purpose**: Style subtitles and merge into final video
- **Key Features**:
  - Comprehensive subtitle styling interface (font, color, position, background)
  - Real-time subtitle preview with video frame overlay
  - Animated GIF preview generation
  - Output format selection (MP4, WebM)
  - Final video processing with progress tracking
  - Video quality and compression settings
  - Final video preview and download
  - Multiple subtitle language support in single video
- **Artifacts Generated**: Final video with burned-in subtitles
- **Next Step Conditions**: Video processing completed successfully

## Workflow State Management

### Artifacts to Preserve Between Steps:
- **Original Video File**: Maintained throughout workflow
- **Extracted Audio**: From Step 1 to Step 2
- **Original Transcription**: From Step 2 through completion
- **Translated Subtitles**: From Step 3 to Step 4
- **Styling Preferences**: User's subtitle styling choices
- **Processing Settings**: Quality, format, and optimization preferences

### Navigation Features:
- **Step Indicators**: Visual progress showing completed, current, and upcoming steps
- **Artifact Status**: Clear indication of what artifacts are available for each step
- **Jump Navigation**: Ability to click on any accessible step to jump directly
- **Validation Gates**: Prevention of accessing steps without required prerequisites
- **Auto-Save**: Automatic preservation of progress and artifacts

## User Experience Enhancements

### Contextual Wording Updates:
- Replace "test page" language with workflow-focused instructions
- Add step-specific help text and tooltips
- Provide clear expectations for each step's duration and requirements
- Include contextual error messages with actionable recovery steps

### Progress Tracking:
- Overall workflow progress indicator
- Step-specific progress for long-running operations
- Estimated time remaining for processing operations
- Success celebrations and milestone acknowledgments

### Flexibility Features:
- **Start Anywhere**: Users can begin from any step with existing files
- **Export Anytime**: Download artifacts at each step for external use
- **Resume Later**: Workflow state persistence across browser sessions
- **Multiple Paths**: Support for different user workflows and preferences

## Success Criteria

### Functional Requirements:
- Users can complete entire video translation workflow from upload to final video
- All existing component functionality is preserved and accessible
- Users can start from any step with appropriate artifacts
- Workflow state is maintained across steps and browser sessions
- Navigation is intuitive with clear progress indicators
- Error handling and recovery work seamlessly across all steps

### Performance Requirements:
- Step transitions are fast and responsive
- Artifact passing between steps is efficient
- Memory management works effectively for large videos throughout workflow
- Processing times are optimized and clearly communicated

### User Experience Requirements:
- Interface is intuitive for both new and experienced users
- Workflow provides clear guidance and expectations
- Error messages are helpful and actionable
- Progress tracking keeps users informed throughout long operations
- Final output meets user expectations for quality and format

## Future Enhancement Considerations

### Advanced Features:
- Batch processing multiple videos through the same workflow
- Workflow templates for common translation scenarios
- Advanced subtitle synchronization and timing tools
- Multiple subtitle track support in single video
- Collaborative workflow sharing and review features

### Integration Opportunities:
- Cloud storage integration for large video files
- External translation service integration
- Professional subtitle format support (ASS, VTT)
- Video hosting platform integration for direct upload

## Completion Notes

_This section will be filled when the user story is completed._