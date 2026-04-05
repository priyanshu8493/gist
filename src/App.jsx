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

function DocumentIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/>
      <line x1="10" y1="9" x2="8" y2="9" strokeLinecap="round"/>
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin"></div>
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-fuchsia-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
    </div>
  )
}

function GistSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 rounded-xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10"></div>
      <div className="space-y-3">
        <div className="h-3 rounded-full bg-white/5 w-full"></div>
        <div className="h-3 rounded-full bg-white/5 w-11/12"></div>
        <div className="h-3 rounded-full bg-white/5 w-4/5"></div>
        <div className="h-3 rounded-full bg-white/5 w-9/12"></div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 rounded-full bg-white/5 w-full"></div>
        <div className="h-3 rounded-full bg-white/5 w-10/12"></div>
        <div className="h-3 rounded-full bg-white/5 w-8/12"></div>
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
  const viewerRef = useRef(null)
  const fileInputRef = useRef(null)

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
    const file = e.dataTransfer.files[0]
    handleFile(file)
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

  const handleGetGist = async () => {
    if (!selectedText) return

    hideFloatingButton()
    setPanelOpen(true)
    setIsLoading(true)
    setGistContent(null)

    // TODO: Replace this mock implementation with your LLM API call
    // Example structure:
    // const response = await fetch('/api/gist', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: selectedText })
    // })
    // const data = await response.json()

    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockExplanations = [
      `This passage introduces fundamental concepts that build upon each other progressively. The core idea here relates to establishing a foundation for understanding more complex principles discussed later in the document. Breaking this down: the author establishes context, presents key definitions, and then demonstrates practical applications through concrete examples.`,
      `Analyzing this section reveals multiple layers of meaning. Beyond the surface-level explanation, there's an underlying assumption about reader familiarity with prerequisite concepts. The text strategically positions these ideas to prepare you for advanced topics that follow, creating a logical progression of knowledge.`,
      `This content appears to bridge theoretical concepts with real-world applications. Notice how the author balances technical precision with accessibility, making complex ideas digestible. The implications here extend beyond immediate comprehension—you'll find these principles resurface throughout subsequent chapters.`,
      `The significance of this passage lies in its role as a turning point in the argument. Here, the author shifts from establishing facts to drawing conclusions. Pay attention to the logical connectors ("therefore," "consequently," "this means")—they signal the transition from evidence to interpretation.`
    ]

    setGistContent({
      analyzedText: selectedText,
      explanation: mockExplanations[Math.floor(Math.random() * mockExplanations.length)],
      timestamp: new Date().toISOString()
    })
    setIsLoading(false)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => {
      setGistContent(null)
      setSelectedText('')
    }, 300)
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[128px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <SparkleIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Gist</span>
          </div>
          {pdfFile && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/50">{pdfFile.name}</span>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-xs text-white/70">Page</span>
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-10 bg-transparent text-center text-sm font-medium focus:outline-none"
                />
                <span className="text-xs text-white/50">of {numPages}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex h-[calc(100vh-65px)]">
        {/* PDF Viewer area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-2xl mx-auto">
            {!pdfFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative group
                  bg-gradient-to-b from-white/[0.08] to-white/[0.02]
                  border-2 border-dashed rounded-3xl p-16
                  transition-all duration-300 cursor-pointer
                  ${isDragging
                    ? 'border-violet-400 bg-violet-500/10 scale-[1.02]'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/0 via-fuchsia-500/0 to-violet-500/0 group-hover:from-violet-500/10 group-hover:via-fuchsia-500/5 group-hover:to-violet-500/10 transition-all duration-500 pointer-events-none"></div>

                <div className={`relative transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {/* Animated document icon */}
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl"></div>
                    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                      <DocumentIcon className="w-10 h-10 text-white/80" />
                    </div>
                    {/* Floating sparkle */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                      <SparkleIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-semibold text-center mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {isDragging ? 'Drop your PDF here' : 'Upload a PDF to begin'}
                  </h2>
                  <p className="text-center text-white/50 mb-8 max-w-sm mx-auto">
                    {isDragging
                      ? 'Release to start exploring'
                      : 'Drag and drop a PDF file, or click anywhere to browse'
                    }
                  </p>

                  {/* Feature hints */}
                  <div className="flex items-center justify-center gap-8 text-sm text-white/40">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 232l-7-7 7-7" />
                        </svg>
                      </div>
                      <span>Select text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                        <SparkleIcon className="w-3 h-3" />
                      </div>
                      <span>Get explanations</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 transition-all duration-500">
                {/* PDF controls */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPdfFile(null)}
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      title="Remove PDF"
                    >
                      <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button
                      onClick={() => goToPage(pageNumber - 1)}
                      disabled={pageNumber <= 1}
                      className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-sm font-medium">{pageNumber}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-sm text-white/50">{numPages}</span>
                    </div>
                    <button
                      onClick={() => goToPage(pageNumber + 1)}
                      disabled={pageNumber >= numPages}
                      className="p-2 rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Page thumbnails - simplified */}
                  <div className="flex items-center gap-2">
                    {numPages && numPages > 1 && Array.from({ length: Math.min(5, numPages) }, (_, i) => {
                      const page = i === 0 ? 1 : i === 4 ? numPages : pageNumber + i - 2
                      if (page < 1 || page > numPages) return null
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                            page === pageNumber
                              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                              : 'bg-white/5 hover:bg-white/10 text-white/50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* PDF Viewer */}
                <div
                  ref={viewerRef}
                  className="relative rounded-2xl overflow-hidden bg-white shadow-2xl"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Page glow */}
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-white/5 pointer-events-none"></div>

                  <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex flex-col items-center justify-center h-96 gap-4">
                        <LoadingSpinner />
                        <span className="text-sm text-white/50">Loading document...</span>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={Math.min(680, typeof window !== 'undefined' ? window.innerWidth - 128 : 680)}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>

                  {/* Floating action button */}
                  {buttonPosition && (
                    <button
                      onClick={handleGetGist}
                      className="group absolute z-20 flex items-center gap-2 px-5 py-2.5 rounded-full
                        bg-gradient-to-r from-violet-600 to-fuchsia-600
                        text-white text-sm font-medium
                        shadow-[0_0_40px_rgba(139,92,246,0.5)]
                        hover:shadow-[0_0_60px_rgba(139,92,246,0.7)]
                        active:scale-95
                        transition-all duration-200"
                      style={{
                        top: buttonPosition.top,
                        left: buttonPosition.left,
                        transform: 'translate(-50%, -100%)',
                        animation: 'floatIn 0.2s ease-out'
                      }}
                    >
                      <SparkleIcon className="w-4 h-4 animate-pulse" />
                      <span>Get Gist</span>
                      <div className="w-1 h-1 rounded-full bg-white/50"></div>
                      <span className="text-white/70 text-xs max-w-32 truncate">
                        {selectedText.slice(0, 20)}{selectedText.length > 20 ? '...' : ''}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div
          className={`
            w-96 border-l border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/[0.03] to-transparent
            transition-all duration-300 ease-out flex flex-col
            ${panelOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
          `}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center">
                <SparkleIcon className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">AI Gist</h2>
                <p className="text-xs text-white/40">Powered by advanced reasoning</p>
              </div>
            </div>
            <button
              onClick={closePanel}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-auto p-5">
            {isLoading ? (
              <GistSkeleton />
            ) : gistContent ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Selected text card */}
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">Selected Text</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed italic">
                    "{gistContent.analyzedText}"
                  </p>
                </div>

                {/* Explanation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-fuchsia-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-fuchsia-400 uppercase tracking-wider">Explanation</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {gistContent.explanation}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save
                  </button>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-white/30">
                  <span>Generated just now</span>
                  <span>Using GPT-4</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <SparkleIcon className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="font-medium text-white/50 mb-2">Ready to analyze</h3>
                <p className="text-sm text-white/30 max-w-[240px]">
                  Select any text in your PDF and click "Get Gist" for an AI-powered explanation
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global styles for animations */}
      <style>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translate(-50%, -90%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* Selection color */
        ::selection {
          background: rgba(139, 92, 246, 0.3);
          color: white;
        }
        
        /* PDF text selection */
        .react-pdf__Page__textContent {
          user-select: text !important;
        }
        
        .react-pdf__Page__textContent span::selection {
          background: rgba(139, 92, 246, 0.3) !important;
        }
      `}</style>
    </div>
  )
}

export default App
