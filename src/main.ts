import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="container mx-auto p-6">
    <header class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Web Video Translator</h1>
      <p class="text-gray-600">Extract, edit, translate, and merge subtitles for videos</p>
    </header>
    
    <main class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <p class="text-center text-gray-500">Application is loading...</p>
      </div>
    </main>
  </div>
`