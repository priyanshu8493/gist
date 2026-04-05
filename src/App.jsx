import { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

function SparkleIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L19 7L14.74 11.27L19 14L13.09 13.74L12 20L10.91 13.74L5 14L9.26 11.27L5 7L10.91 8.26L12 2Z" fill="currentColor"/>
    </svg>
  )
}

function UploadIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FileIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PanelIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="15" y1="3" x2="15" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-8">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
      <div className="space-y-3 px-2">
        <div className="h-4 bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-800/60 rounded w-11/12"></div>
        <div className="h-4 bg-slate-800/40 rounded w-4/5"></div>
        <div className="h-4 bg-slate-800/60 rounded w-9/12"></div>
      </div>
    </div>
  )
}

function GistCard({ content }) {
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Selected</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">"{content.analyzedText}"</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <SparkleIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Explanation</span>
        </div>
        <div className="space-y-3">
          {content.explanation.split('. ').filter(Boolean).map((sentence, i) => (
            <p key={i} className="text-sm text-slate-400 leading-relaxed">
              {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
            </p>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save
        </button>
      </div>
    </div>
  )
}

function App() {
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedText, setSelectedText] = useState('')
  const [buttonPosition, setButtonPosition] = useState(null)
  const [gistContent, setGistContent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [pdfScale, setPdfScale] = useState(1)
  const viewerRef = useRef(null)
  const fileInputRef = useRef(null)
  const panelRef = useRef(null)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const handleFile = (file) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setSelectedText('')
      setButtonPosition(null)
      setPanelOpen(false)
      setGistContent(null)
      setPageNumber(1)
    }
  }

  const handleFileChange = (e) => {
    handleFile(e.target.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const hideFloatingButton = useCallback(() => {
    setButtonPosition(null)
    setSelectedText('')
  }, [])

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (text && text.length > 0 && viewerRef.current?.contains(selection?.anchorNode)) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const viewerRect = viewerRef.current.getBoundingClientRect()

        setSelectedText(text)
        setButtonPosition({
          top: rect.top - viewerRect.top - 48,
          left: rect.left - viewerRect.left + rect.width / 2
        })
      } else if (buttonPosition) {
        hideFloatingButton()
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [buttonPosition, hideFloatingButton])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!pdfFile) return
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setPageNumber(p => Math.max(1, p - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setPageNumber(p => Math.min(numPages, p + 1))
      } else if (e.key === '=' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPdfScale(s => Math.min(2, s + 0.1))
      } else if (e.key === '-' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPdfScale(s => Math.max(0.5, s - 0.1))
      } else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPdfScale(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pdfFile, numPages])

  const handleGetGist = async () => {
    if (!selectedText) return

    hideFloatingButton()
    setPanelOpen(true)
    setIsLoading(true)
    setGistContent(null)

    // TODO: Replace this mock with your LLM API call
    // const response = await fetch('/api/gist', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: selectedText })
    // })
    // const data = await response.json()

    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockExplanations = [
      `This passage introduces fundamental concepts that build upon each other progressively. The core idea establishes a foundation for understanding more complex principles. The author presents key definitions and demonstrates practical applications through concrete examples.`,
      `Analyzing this section reveals multiple layers of meaning. Beyond the surface-level explanation, there's an underlying assumption about reader familiarity with prerequisite concepts. The text strategically positions these ideas to prepare you for advanced topics.`,
      `This content bridges theoretical concepts with real-world applications. Notice how the author balances technical precision with accessibility, making complex ideas digestible. The implications extend beyond immediate comprehension.`,
      `The significance of this passage lies in its role as a pivotal point in the argument. Here, the author shifts from establishing facts to drawing conclusions. Pay attention to logical connectors that signal the transition from evidence to interpretation.`
    ]

    setGistContent({
      analyzedText: selectedText,
      explanation: mockExplanations[Math.floor(Math.random() * mockExplanations.length)]
    })
    setIsLoading(false)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => {
      setGistContent(null)
      setSelectedText('')
    }, 200)
  }

  const resetPdf = () => {
    setPdfFile(null)
    setNumPages(null)
    setPageNumber(1)
    setGistContent(null)
    setPanelOpen(false)
  }

  const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1400
  const sidebarWidth = panelOpen ? 400 : 0
  const availableWidth = containerWidth - 280 - sidebarWidth
  const pdfWidth = Math.min(720, availableWidth - 80)

  return (
    <div className="h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 flex-shrink-0 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <SparkleIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-200 tracking-tight">Gist</span>
          </div>
          
          {pdfFile && (
            <>
              <div className="w-px h-5 bg-slate-700/60"></div>
              <button
                onClick={resetPdf}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>New File</span>
              </button>
            </>
          )}
        </div>

        {pdfFile && (
          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 px-1 py-0.5 rounded-lg bg-slate-900/50 border border-slate-800/50">
              <button
                onClick={() => setPdfScale(s => Math.max(0.5, s - 0.1))}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                title="Zoom out (Cmd+-)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-14 text-center text-xs font-medium text-slate-400">{Math.round(pdfScale * 100)}%</span>
              <button
                onClick={() => setPdfScale(s => Math.min(2, s + 0.1))}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                title="Zoom in (Cmd++)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setPdfScale(1)}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors text-xs font-medium"
                title="Reset zoom (Cmd+0)"
              >
                Fit
              </button>
            </div>

            <div className="w-px h-5 bg-slate-700/60"></div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page (←)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/50 border border-slate-800/50">
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    if (val >= 1 && val <= numPages) setPageNumber(val)
                  }}
                  className="w-8 bg-transparent text-center text-sm font-medium text-slate-200 focus:outline-none"
                />
                <span className="text-slate-500 text-sm">/</span>
                <span className="text-slate-500 text-sm">{numPages}</span>
              </div>
              
              <button
                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page (→)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="w-px h-5 bg-slate-700/60"></div>

            {/* Toggle panel */}
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                panelOpen
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PanelIcon className="w-4 h-4" />
              <span>AI Panel</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File List / Tools */}
        <aside className="w-64 flex-shrink-0 border-r border-slate-800/60 bg-slate-950/50 flex flex-col">
          <div className="p-4 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</span>
            </div>
            
            {!pdfFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                  ${isDragging
                    ? 'border-indigo-500/60 bg-indigo-500/5'
                    : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-900/30'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-800/50'}`}>
                  <UploadIcon className={`w-5 h-5 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
                </div>
                
                <span className="text-sm text-slate-400 text-center">
                  {isDragging ? 'Drop PDF here' : 'Drop PDF or click'}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                  <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{pdfFile.name}</p>
                    <p className="text-xs text-slate-500">{numPages} pages</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="p-4 mt-auto border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Shortcuts</span>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Navigate pages</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-900/50 border border-slate-800/50 text-xs text-slate-400 font-mono">← →</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Zoom</span>
                <div className="flex gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900/50 border border-slate-800/50 text-xs text-slate-400 font-mono">⌘+</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900/50 border border-slate-800/50 text-xs text-slate-400 font-mono">⌘-</kbd>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* PDF Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/20">
          {!pdfFile ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                    <SparkleIcon className="w-10 h-10 text-indigo-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <SparkleIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Upload a PDF to start</h2>
                <p className="text-sm text-slate-500 mb-6">Select any text to get AI-powered explanations instantly</p>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  <UploadIcon className="w-4 h-4" />
                  Choose File
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-8">
              <div className="mx-auto" style={{ width: pdfWidth }}>
                <div
                  ref={viewerRef}
                  className="relative bg-white rounded-lg overflow-hidden shadow-2xl"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <LoadingState />
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={pdfScale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>

                  {/* Floating action button */}
                  {buttonPosition && (
                    <button
                      onClick={handleGetGist}
                      className="group absolute z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-full
                        bg-indigo-600 hover:bg-indigo-500
                        text-white text-sm font-medium
                        shadow-lg shadow-indigo-500/30
                        hover:shadow-xl hover:shadow-indigo-500/40
                        active:scale-95
                        transition-all duration-150"
                      style={{
                        top: buttonPosition.top,
                        left: buttonPosition.left,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      <SparkleIcon className="w-4 h-4" />
                      <span>Get Gist</span>
                      <span className="w-px h-4 bg-white/30"></span>
                      <span className="text-white/70 text-xs max-w-24 truncate">
                        {selectedText.slice(0, 18)}{selectedText.length > 18 ? '...' : ''}
                      </span>
                    </button>
                  )}
                </div>

                {/* Page indicator */}
                <div className="flex items-center justify-center gap-4 mt-6 pb-4">
                  <button
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(10, numPages) }, (_, i) => {
                      let page
                      if (numPages <= 10) {
                        page = i + 1
                      } else if (pageNumber <= 6) {
                        page = i + 1
                        if (i === 9) page = numPages
                      } else if (pageNumber >= numPages - 5) {
                        page = numPages - 9 + i
                        if (i === 0) page = 1
                      } else {
                        page = pageNumber - 5 + i
                        if (i === 0) page = 1
                        if (i === 9) page = numPages
                      }
                      
                      const isActive = page === pageNumber
                      const isEllipsis = (i === 0 && page !== 1) || (i === 9 && page !== numPages)
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setPageNumber(page)}
                          className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : isEllipsis
                              ? 'text-slate-600 cursor-default'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                          }`}
                          disabled={isEllipsis}
                        >
                          {isEllipsis ? '...' : page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                    disabled={pageNumber >= numPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* AI Panel */}
        <aside
          ref={panelRef}
          className={`flex-shrink-0 border-l border-slate-800/60 bg-slate-950/80 backdrop-blur-sm flex flex-col transition-all duration-200 ease-out ${
            panelOpen ? 'w-96' : 'w-0 overflow-hidden'
          }`}
        >
          {panelOpen && (
            <>
              <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <SparkleIcon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-200">AI Gist</h2>
                    <p className="text-xs text-slate-500">Powered by advanced AI</p>
                  </div>
                </div>
                <button
                  onClick={closePanel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {isLoading ? (
                  <LoadingState />
                ) : gistContent ? (
                  <GistCard content={gistContent} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-14 h-14 rounded-xl bg-slate-900/50 border border-slate-800/50 flex items-center justify-center mb-4">
                      <SparkleIcon className="w-7 h-7 text-slate-600" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">No selection yet</h3>
                    <p className="text-xs text-slate-600 max-w-[200px]">
                      Select text in your PDF and click "Get Gist" for an explanation
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }
        ::selection {
          background: rgba(99, 102, 241, 0.3);
        }
        .react-pdf__Page__textContent {
          user-select: text !important;
        }
      `}</style>
    </div>
  )
}

export default App
