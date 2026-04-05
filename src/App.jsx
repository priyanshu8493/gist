import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Icons
const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
const SparkleIcon = ({ className = '' }) => <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2L13.09 8.26L19 7L14.74 11.27L19 14L13.09 13.74L12 20L10.91 13.74L5 14L9.26 11.27L5 7L10.91 8.26L12 2Z" fill="currentColor"/></svg>
const BookIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const XIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
const ChevronLeftIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
const ChevronRightIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
const UploadIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
const SendIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
const BrainIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5"/></svg>
const LightbulbIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
const QuoteIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.3 7.3c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5S7.4 4.8 8.8 4.8s2.5 1.1 2.5 2.5zm1.7 5.9c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5zM18 7.3c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5S14.1 4.8 15.5 4.8s2.5 1.1 2.5 2.5zm1.7 5.9c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5z"/></svg>
const UserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const ChatIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getInitials = (name) => name.replace('.pdf', '').split(' ').filter(w => w.length > 0).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const getAvatarColor = (name) => {
  const colors = ['from-rose-500 to-pink-500', 'from-violet-500 to-purple-500', 'from-blue-500 to-indigo-500', 'from-cyan-500 to-teal-500', 'from-emerald-500 to-green-500', 'from-amber-500 to-orange-500']
  return colors[name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length]
}

const STORAGE_KEY = 'gist_library'
const loadLibraryMeta = () => { try { const data = localStorage.getItem(STORAGE_KEY); return data ? JSON.parse(data) : [] } catch { return [] } }
const saveLibraryMeta = (books) => localStorage.setItem(STORAGE_KEY, JSON.stringify(books))

// AI functions
const getGistFromAI = async (selectedText) => {
  if (!GROQ_API_KEY) return 'Please add your Groq API key to .env file'
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Explain this passage concisely in 2-3 sentences:\n\n"${selectedText}"`
        }],
        temperature: 0.7,
        max_tokens: 300
      })
    })
    if (!response.ok) throw new Error('API failed')
    const data = await response.json()
    return data.choices[0]?.message?.content || 'Could not generate gist'
  } catch (error) {
    console.error('Groq API error:', error)
    return 'Failed to get explanation. Please try again.'
  }
}

const chatWithAI = async (messages) => {
  if (!GROQ_API_KEY) return { role: 'assistant', content: 'Please add your Groq API key' }
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 600
      })
    })
    if (!response.ok) throw new Error('API failed')
    const data = await response.json()
    return data.choices[0]?.message || { role: 'assistant', content: 'Something went wrong' }
  } catch (error) {
    console.error('Groq API error:', error)
    return { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
  }
}

// Book Card Component
function BookCard({ book, onClick, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  const progress = book.lastPage && book.totalPages ? Math.round((book.lastPage / book.totalPages) * 100) : 0

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br ${getAvatarColor(book.name)} shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <span className="text-3xl font-semibold text-white/40 mb-2">{getInitials(book.name)}</span>
        </div>
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
            <div className="h-full bg-white/60" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-white font-medium">Read</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>
        {showMenu && (
          <div className="absolute top-12 right-2 w-36 py-1 rounded-xl bg-white/95 backdrop-blur-xl shadow-lg border border-gray-200/50 z-10" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <span className="w-4 h-4"><TrashIcon /></span> Delete
            </button>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-900 truncate leading-tight">{book.name.replace('.pdf', '')}</h4>
        <p className="text-xs text-gray-500 mt-1">{formatDate(book.addedAt)}</p>
      </div>
    </div>
  )
}

// Library Component
function Library({ library, onSelectBook, onDeleteBook, onAddBook }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return library
    return library.filter(book => book.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [library, searchQuery])

  const recentBooks = useMemo(() => [...library].sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead)).filter(b => b.lastPage).slice(0, 4), [library])

  const totalBooks = library.length
  const booksInProgress = library.filter(b => b.lastPage && b.totalPages && b.lastPage < b.totalPages).length

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <span className="w-5 h-5 text-white"><SparkleIcon /></span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Gist</h1>
              <p className="text-xs text-gray-500">Read. Learn. Grow.</p>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-colors cursor-pointer">
            <span className="w-4 h-4"><UploadIcon /></span>
            Add PDF
            <input type="file" accept=".pdf" className="hidden" onChange={onAddBook} />
          </label>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-8 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-semibold text-gray-900 tracking-tight leading-[1.1]">
              Your personal<br />reading companion.
            </h2>
            <p className="mt-5 text-xl text-gray-500 max-w-lg leading-relaxed">
              Upload any PDF and get instant AI-powered explanations for any passage you select.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <label className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-gray-900/20">
                <span className="w-5 h-5"><UploadIcon /></span>
                Upload PDF
                <input type="file" accept=".pdf" className="hidden" onChange={onAddBook} />
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                AI Ready
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <span className="w-5 h-5 text-blue-600"><SparkleIcon /></span>
              </div>
              <h3 className="font-medium text-gray-900">AI Explanations</h3>
              <p className="text-sm text-gray-600 mt-1">Get instant insights for any selected text</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/50">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <span className="w-5 h-5 text-purple-600"><BrainIcon /></span>
              </div>
              <h3 className="font-medium text-gray-900">Deep Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Understand complex concepts easily</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                <span className="w-5 h-5 text-amber-600"><LightbulbIcon /></span>
              </div>
              <h3 className="font-medium text-gray-900">Key Insights</h3>
              <p className="text-sm text-gray-600 mt-1">Extract important points automatically</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <span className="w-5 h-5 text-emerald-600"><ChatIcon /></span>
              </div>
              <h3 className="font-medium text-gray-900">Chat & Learn</h3>
              <p className="text-sm text-gray-600 mt-1">Ask follow-up questions about any topic</p>
            </div>
          </div>
        </div>
      </section>

      {totalBooks > 0 && (
        <section className="max-w-6xl mx-auto px-8 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="text-3xl font-semibold text-gray-900">{totalBooks}</div>
              <div className="text-sm text-gray-500 mt-1">Books in library</div>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="text-3xl font-semibold text-gray-900">{booksInProgress}</div>
              <div className="text-sm text-gray-500 mt-1">Currently reading</div>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="text-3xl font-semibold text-gray-900">{library.reduce((acc, b) => acc + (b.lastPage || 0), 0)}</div>
              <div className="text-sm text-gray-500 mt-1">Pages read</div>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-6xl mx-auto px-8 pb-24">
        {library.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <span className="w-10 h-10 text-gray-400"><BookIcon /></span>
            </div>
            <p className="text-lg text-gray-500">Your library is empty</p>
            <p className="text-sm text-gray-400 mt-1">Add your first PDF to get started</p>
          </div>
        ) : (
          <>
            {recentBooks.length > 0 && (
              <section className="mb-12">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">Continue Reading</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {recentBooks.map((book) => (
                    <BookCard key={book.id} book={book} onClick={() => onSelectBook(book.id)} onDelete={() => onDeleteBook(book.id)} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Books</h3>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-full bg-gray-100 border-none text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} onClick={() => onSelectBook(book.id)} onDelete={() => onDeleteBook(book.id)} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <label className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all z-40 cursor-pointer">
        <span className="w-6 h-6"><PlusIcon /></span>
        <input type="file" accept=".pdf" className="hidden" onChange={onAddBook} />
      </label>
    </div>
  )
}

// Chat Message Component
function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
        {isUser ? (
          <span className="w-4 h-4 text-white"><UserIcon /></span>
        ) : (
          <span className="w-4 h-4 text-white"><SparkleIcon /></span>
        )}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser 
            ? 'bg-blue-500 text-white rounded-tr-sm' 
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  )
}

// PDF Reader Component
function PDFReader({ bookId, library, onUpdateBook, onClose }) {
  const book = library[bookId]
  
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(book?.lastPage || 1)
  const [pdfScale, setPdfScale] = useState(1)
  const [selectedText, setSelectedText] = useState('')
  const [showAskButton, setShowAskButton] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState(book?.bookmarks || [])
  const [pdfData] = useState(() => book?.data || null)
  
  // Chat state
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [initialGist, setInitialGist] = useState(null)
  const [chatContext, setChatContext] = useState('')
  
  const viewerRef = useRef(null)
  const containerRef = useRef(null)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const readingProgress = useMemo(() => {
    if (!numPages) return 0
    return Math.round((pageNumber / numPages) * 100)
  }, [pageNumber, numPages])

  useEffect(() => {
    if (numPages && book) {
      onUpdateBook(bookId, { lastPage: pageNumber, lastRead: new Date().toISOString(), totalPages: numPages })
    }
  }, [pageNumber, numPages, bookId, book, onUpdateBook])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    if (!book?.lastPage) setPageNumber(1)
    setPdfScale(1)
  }

  // Text selection handler
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()
      
      if (text && text.length > 3) {
        const selectionRange = selection?.getRangeAt(0)
        if (selectionRange && viewerRef.current?.contains(selectionRange.commonAncestorContainer)) {
          setSelectedText(text)
          setShowAskButton(true)
        }
      }
    }

    document.addEventListener('mouseup', handleSelection)
    return () => document.removeEventListener('mouseup', handleSelection)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setPageNumber(p => Math.max(1, p - 1))
      else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setPageNumber(p => Math.min(numPages || 1, p + 1)) }
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [numPages, onClose])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleGetGist = async () => {
    if (!selectedText) return
    setShowAskButton(false)
    setPanelOpen(true)
    setIsLoading(true)
    setMessages([])
    setInitialGist(null)
    setChatContext(selectedText)
    
    const gist = await getGistFromAI(selectedText)
    setInitialGist(gist)
    setIsLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    
    const userMessage = { role: 'user', content: inputValue }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)
    
    const systemPrompt = `You are a helpful reading companion. The user is reading a document. Here's the original passage they're studying: "${chatContext}". Answer their follow-up question based on this context. Be clear and concise.`
    
    const response = await chatWithAI([
      { role: 'system', content: systemPrompt },
      ...newMessages
    ])
    
    setMessages([...newMessages, response])
    setIsLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleBookmark = () => {
    const newBookmarks = bookmarks.includes(pageNumber)
      ? bookmarks.filter(b => b !== pageNumber)
      : [...bookmarks, pageNumber].sort((a, b) => a - b)
    setBookmarks(newBookmarks)
    onUpdateBook(bookId, { bookmarks: newBookmarks })
  }

  if (!book) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Book not found</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded-lg">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 z-10">
        <div className="h-full bg-blue-500" style={{ width: `${readingProgress}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 h-14 px-4 flex items-center justify-between bg-white border-b border-gray-200/80 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <span className="w-5 h-5"><ChevronLeftIcon /></span>
          </button>
          <div>
            <h2 className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{book.name.replace('.pdf', '')}</h2>
            <p className="text-xs text-gray-500">Page {pageNumber} of {numPages || '...'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleBookmark} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${bookmarks.includes(pageNumber) ? 'text-amber-500 bg-amber-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <svg viewBox="0 0 24 24" fill={bookmarks.includes(pageNumber) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>

          <button onClick={() => setPanelOpen(!panelOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${panelOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <span className="w-4 h-4"><SparkleIcon /></span>
            <span className="hidden sm:inline">AI Chat</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Viewer */}
        <main ref={containerRef} className="flex-1 overflow-auto flex flex-col items-center py-6 px-4 bg-gray-100">
          {!pdfData ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin mb-4"/>
              <p className="text-gray-500">Loading PDF...</p>
            </div>
          ) : (
            <div ref={viewerRef} className="relative bg-white shadow-2xl" style={{ maxWidth: '100%' }}>
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin"/>
                  </div>
                }
              >
                <Page pageNumber={pageNumber} scale={pdfScale} renderTextLayer={true} renderAnnotationLayer={true} />
              </Document>
            </div>
          )}
        </main>
        
        {/* Ask AI Button - HIGH VISIBILITY */}
        {showAskButton && selectedText && (
          <div style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 28px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 0.95))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
            cursor: 'pointer',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            transition: 'all 0.2s ease'
          }}
          onClick={handleGetGist}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff, #e0e7ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.09 8.26L19 7L14.74 11.27L19 14L13.09 13.74L12 20L10.91 13.74L5 14L9.26 11.27L5 7L10.91 8.26L12 2Z" fill="#3b82f6"/>
              </svg>
            </div>
            <span style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              Ask AI
            </span>
            <div style={{
              width: '2px',
              height: '28px',
              background: 'rgba(255,255,255,0.5)'
            }}></div>
            <span style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'system-ui, sans-serif',
              maxWidth: '280px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              "{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"
            </span>
          </div>
        )}

        {/* Chat Panel */}
        <aside className={`flex-shrink-0 border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ${panelOpen ? 'w-96' : 'w-0 overflow-hidden'}`}>
          {panelOpen && (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="w-5 h-5 text-white"><SparkleIcon /></span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">AI Reading Assistant</h3>
                  <p className="text-xs text-gray-500">Ask anything about your reading</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {!initialGist && !isLoading && messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                      <span className="w-8 h-8 text-blue-600"><SparkleIcon /></span>
                    </div>
                    <h4 className="text-base font-medium text-gray-800 mb-2">Select text & tap Ask AI</h4>
                    <p className="text-sm text-gray-500 max-w-[240px]">
                      Highlight any text in the PDF, then click "Ask AI" to get an explanation
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Initial Gist */}
                    {initialGist && (
                      <div className="space-y-4">
                        {/* Selected text */}
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <p className="text-xs text-blue-600 font-medium mb-1">Selected:</p>
                          <p className="text-sm text-gray-700 italic line-clamp-3">"{chatContext.slice(0, 150)}{chatContext.length > 150 ? '...' : ''}"</p>
                        </div>
                        
                        {/* Gist response */}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <span className="w-4 h-4 text-white"><SparkleIcon /></span>
                          </div>
                          <div className="max-w-[80%]">
                            <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100 text-sm text-gray-800 leading-relaxed">
                              {initialGist}
                            </div>
                          </div>
                        </div>
                        
                        {/* Follow-up hint */}
                        <p className="text-xs text-gray-400 text-center">Ask follow-up questions below</p>
                      </div>
                    )}
                    
                    {/* Chat messages */}
                    {messages.map((msg, i) => (
                      <ChatMessage key={i} message={msg} />
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <span className="w-4 h-4 text-white"><SparkleIcon /></span>
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask a follow-up question..."
                    rows={1}
                    disabled={!initialGist && messages.length === 0}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 border-none text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading || (!initialGist && messages.length === 0)}
                    className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                  >
                    <span className="w-5 h-5"><SendIcon /></span>
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 h-16 px-4 flex items-center justify-center gap-4 bg-white border-t border-gray-200/80">
        <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.25))} className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm font-medium transition-colors">
          A-
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">{Math.round(pdfScale * 100)}%</span>
        <button onClick={() => setPdfScale(s => Math.min(3, s + 0.25))} className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm font-medium transition-colors">
          A+
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <span className="w-5 h-5"><ChevronLeftIcon /></span>
        </button>
        
        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100">
          <input
            type="number"
            min={1}
            max={numPages}
            value={pageNumber}
            onChange={(e) => { const val = parseInt(e.target.value); if (val >= 1 && val <= numPages) setPageNumber(val) }}
            className="w-12 bg-transparent text-center text-sm font-semibold text-gray-900 focus:outline-none"
          />
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-500">{numPages || '-'}</span>
        </div>
        
        <button onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} disabled={pageNumber >= (numPages || 1)} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <span className="w-5 h-5"><ChevronRightIcon /></span>
        </button>
      </footer>

      <style>{`
        .react-pdf__Page__textContent {
          user-select: text !important;
        }
        .react-pdf__Page__textContent * {
          user-select: text !important;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.02); }
        }
      `}</style>
    </div>
  )
}

// Main App
function App() {
  const [libraryMeta, setLibraryMeta] = useState(() => loadLibraryMeta())
  const [pdfStore, setPdfStore] = useState({})
  const [currentBookId, setCurrentBookId] = useState(null)

  const handleAddBook = useCallback((e) => {
    const file = e.target.files[0]
    if (!file || file.type !== 'application/pdf') return

    const reader = new FileReader()
    reader.onload = (event) => {
      const newBook = {
        id: Date.now().toString(),
        name: file.name,
        addedAt: new Date().toISOString(),
        lastRead: new Date().toISOString(),
        lastPage: null,
        totalPages: null,
        bookmarks: []
      }
      const newLibrary = [newBook, ...libraryMeta]
      setLibraryMeta(newLibrary)
      saveLibraryMeta(newLibrary)
      setPdfStore(prev => ({ ...prev, [newBook.id]: event.target.result }))
      setCurrentBookId(newBook.id)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [libraryMeta])

  const handleSelectBook = useCallback((bookId) => setCurrentBookId(bookId), [])
  
  const handleDeleteBook = useCallback((bookId) => {
    const newLibrary = libraryMeta.filter(b => b.id !== bookId)
    setLibraryMeta(newLibrary)
    saveLibraryMeta(newLibrary)
    setPdfStore(prev => {
      const newStore = { ...prev }
      delete newStore[bookId]
      return newStore
    })
    if (currentBookId === bookId) setCurrentBookId(null)
  }, [libraryMeta, currentBookId])

  const handleUpdateBook = useCallback((bookId, updates) => {
    const newLibrary = libraryMeta.map(b => b.id === bookId ? { ...b, ...updates } : b)
    setLibraryMeta(newLibrary)
    saveLibraryMeta(newLibrary)
  }, [libraryMeta])

  const handleCloseReader = useCallback(() => setCurrentBookId(null), [])

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Library 
        library={libraryMeta} 
        onSelectBook={handleSelectBook} 
        onDeleteBook={handleDeleteBook} 
        onAddBook={handleAddBook} 
      />
      {currentBookId && (
        <PDFReader 
          bookId={currentBookId} 
          library={{ ...libraryMeta, [currentBookId]: { ...libraryMeta.find(b => b.id === currentBookId), data: pdfStore[currentBookId] } }}
          onUpdateBook={handleUpdateBook} 
          onClose={handleCloseReader}
        />
      )}
    </div>
  )
}

export default App
