import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const Icons = {
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Sparkle: () => <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L13.09 8.26L19 7L14.74 11.27L19 14L13.09 13.74L12 20L10.91 13.74L5 14L9.26 11.27L5 7L10.91 8.26L12 2Z" fill="currentColor"/></svg>,
  Book: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  ChevronLeft: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Brain: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Lightbulb: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  MessageSquare: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bookmark: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  Maximize: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Loader: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>,
}

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
  const colors = [
    { from: '#f43f5e', to: '#ec4899' },
    { from: '#8b5cf6', to: '#a855f7' },
    { from: '#3b82f6', to: '#6366f1' },
    { from: '#06b6d4', to: '#14b8a6' },
    { from: '#10b981', to: '#22c55e' },
    { from: '#f59e0b', to: '#f97316' },
  ]
  return colors[name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length]
}

const STORAGE_KEY = 'gist_library'
const loadLibraryMeta = () => { try { const data = localStorage.getItem(STORAGE_KEY); return data ? JSON.parse(data) : [] } catch { return [] } }
const saveLibraryMeta = (books) => localStorage.setItem(STORAGE_KEY, JSON.stringify(books))

const LANGUAGES = {
  en: { name: 'English', code: 'en', prompt: 'Explain this concisely in 2-3 sentences in English:' },
  hi: { name: 'Hindi', code: 'hi', prompt: 'इसे संक्षेप में 2-3 वाक्यों में हिंदी में समझाएं:' },
  bn: { name: 'Bengali', code: 'bn', prompt: 'এটি ২-৩টি বাক্যে বাংলায় সংক্ষেপে ব্যাখ্যা করুন:' }
}

const getGistFromAI = async (selectedText, lang = 'en') => {
  if (!GROQ_API_KEY) return 'Please add your Groq API key in the .env file.'
  const langConfig = LANGUAGES[lang] || LANGUAGES.en
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: `${langConfig.prompt}\n\n"${selectedText}"` }], temperature: 0.7, max_tokens: 300 })
    })
    if (!response.ok) throw new Error('API failed')
    return response.json().then(data => data.choices[0]?.message?.content || 'Could not generate gist')
  } catch { return 'Failed to get explanation. Please try again.' }
}

const getPageSummaryFromAI = async (textContent, lang = 'en') => {
  if (!GROQ_API_KEY) return 'Please add your Groq API key in the .env file.'
  const langConfig = LANGUAGES[lang] || LANGUAGES.en
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: `${langConfig.prompt.replace('2-3 sentences', 'a comprehensive summary')}\n\nProvide a clear summary of this page:\n\n"${textContent.substring(0, 3000)}"` }], temperature: 0.7, max_tokens: 500 })
    })
    if (!response.ok) throw new Error('API failed')
    return response.json().then(data => data.choices[0]?.message?.content || 'Could not generate summary')
  } catch { return 'Failed to get summary. Please try again.' }
}

const chatWithAILang = async (messages, lang = 'en') => {
  if (!GROQ_API_KEY) return { role: 'assistant', content: 'Please add your Groq API key' }
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.7, max_tokens: 600 })
    })
    if (!response.ok) throw new Error('API failed')
    return response.json().then(data => data.choices[0]?.message || { role: 'assistant', content: 'Something went wrong' })
  } catch { return { role: 'assistant', content: lang !== 'en' ? 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।' : 'Sorry, something went wrong.' } }
}

function BookCard({ book, onClick, onDelete, index = 0 }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const progress = book.lastPage && book.totalPages ? Math.round((book.lastPage / book.totalPages) * 100) : 0
  const color = getAvatarColor(book.name)
  const animationDelay = `${index * 50}ms`

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  return (
    <div className="group cursor-pointer animate-fade-in-up" onClick={onClick} style={{ animationDelay }}>
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:-translate-y-1"
        style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold text-white/40 tracking-tight">{getInitials(book.name)}</span>
        </div>
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div className="h-full bg-white/70 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="px-4 py-2 rounded-full bg-white/95 text-gray-900 text-sm font-medium shadow-lg">Read Now</span>
        </div>
        <div ref={menuRef} className="absolute top-2 right-2">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }} 
            className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
          {showMenu && (
            <div className="absolute top-10 right-0 w-40 py-1.5 rounded-xl bg-white/95 backdrop-blur-xl shadow-xl border border-gray-200/50 z-10 overflow-hidden">
              <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false) }} 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <span className="w-4 h-4"><Icons.Trash /></span> Remove Book
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 px-1">
        <h4 className="text-sm font-medium text-gray-900 truncate leading-tight">{book.name.replace('.pdf', '')}</h4>
        <p className="text-xs text-gray-500 mt-1">{formatDate(book.addedAt)}</p>
      </div>
    </div>
  )
}

function Library({ library, onSelectBook, onDeleteBook, onAddBook }) {
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef(null)
  const filteredBooks = useMemo(() => searchQuery ? library.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())) : library, [library, searchQuery])
  const recentBooks = useMemo(() => [...library].sort((a, b) => new Date(b.lastRead) - new Date(a.lastRead)).filter(b => b.lastPage).slice(0, 4), [library])
  const stats = useMemo(() => ({ total: library.length, reading: library.filter(b => b.lastPage && b.totalPages && b.lastPage < b.totalPages).length, pages: library.reduce((acc, b) => acc + (b.lastPage || 0), 0) }), [library])

  const features = [
    { icon: <Icons.Sparkle />, title: 'Smart Explanations', desc: 'Get instant AI-powered insights on any passage', gradient: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-200/60', iconColor: 'text-blue-600', iconBg: 'bg-blue-500/10' },
    { icon: <Icons.Maximize />, title: 'Full Page Analysis', desc: 'Understand entire pages with one click', gradient: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-200/60', iconColor: 'text-violet-600', iconBg: 'bg-violet-500/10' },
    { icon: <Icons.Lightbulb />, title: 'Key Takeaways', desc: 'Extract main points automatically', gradient: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-200/60', iconColor: 'text-amber-600', iconBg: 'bg-amber-500/10' },
    { icon: <Icons.MessageSquare />, title: 'Interactive Chat', desc: 'Ask follow-up questions naturally', gradient: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200/60', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="w-5 h-5 text-white"><Icons.Sparkle /></span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Gist</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Your reading companion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"><Icons.Search /></span>
              <input type="text" placeholder="Search library..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} 
                className="pl-9 pr-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all w-48" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors shadow-lg shadow-gray-900/20">
              <span className="w-4 h-4"><Icons.Plus /></span>
              <span>Add PDF</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={onAddBook} />
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-600">Powered by AI</span>
            </div>
            <h2 className="text-5xl font-semibold text-gray-900 tracking-tight leading-[1.1]">
              Read smarter,<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">understand deeper.</span>
            </h2>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-lg">
              Upload any PDF and get instant AI explanations for any passage. Highlight, ask, and learn in seconds.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <button onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5">
                <span className="w-5 h-5"><Icons.Upload /></span> Upload PDF
              </button>
              {library.length > 0 && (
                <span className="text-sm text-gray-500">{library.length} book{library.length !== 1 ? 's' : ''} in library</span>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${f.gradient} border ${f.border} animate-fade-in-up hover:scale-[1.02] transition-transform duration-200`} style={{ animationDelay: `${i * 100 + 200}ms` }}>
                  <div className={`w-9 h-9 rounded-lg ${f.iconBg} flex items-center justify-center mb-3`}>
                    <span className={`w-4.5 h-4.5 ${f.iconColor}`}>{f.icon}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {stats.total > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex gap-4">
            {[{ label: 'Total Books', value: stats.total, icon: <Icons.Book /> }, { label: 'Currently Reading', value: stats.reading, icon: <Icons.Book /> }, { label: 'Pages Read', value: stats.pages, icon: <Icons.Book /> }].map((stat, i) => (
              <div key={stat.label} className="flex-1 p-4 rounded-xl bg-white border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: `${i * 50 + 150}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    <span className="w-5 h-5">{stat.icon}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <main className="max-w-6xl mx-auto px-6 pb-24">
        {library.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-200/60">
              <span className="w-10 h-10 text-gray-400"><Icons.Book /></span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your library is empty</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Upload your first PDF to start getting AI-powered explanations and insights.</p>
            <button onClick={() => fileInputRef.current?.click()} 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors">
              <span className="w-4 h-4"><Icons.Plus /></span> Upload Your First PDF
            </button>
          </div>
        ) : (
          <>
            {recentBooks.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Continue Reading</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {recentBooks.map(b => <BookCard key={b.id} book={b} onClick={() => onSelectBook(b.id)} onDelete={() => onDeleteBook(b.id)} />)}
                </div>
              </section>
            )}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">All Books ({filteredBooks.length})</h3>
              </div>
              {filteredBooks.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No books found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredBooks.map((b, i) => <BookCard key={b.id} book={b} onClick={() => onSelectBook(b.id)} onDelete={() => onDeleteBook(b.id)} index={i} />)}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
        {isUser ? <span className="w-3.5 h-3.5 text-white"><Icons.User /></span> : <span className="w-3.5 h-3.5 text-white"><Icons.Sparkle /></span>}
      </div>
      <div className={`max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
          {message.content}
        </div>
      </div>
    </div>
  )
}

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
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [initialGist, setInitialGist] = useState(null)
  const [chatContext, setChatContext] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryLang, setSummaryLang] = useState('en')
  const [activeLang, setActiveLang] = useState('en')
  
  const viewerRef = useRef(null)
  const containerRef = useRef(null)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const hideTimeoutRef = useRef(null)

  useEffect(() => { if (numPages && book) onUpdateBook(bookId, { lastPage: pageNumber, lastRead: new Date().toISOString(), totalPages: numPages }) }, [pageNumber, numPages, book, bookId, onUpdateBook])

  const onDocumentLoadSuccess = ({ numPages }) => { setNumPages(numPages); if (!book?.lastPage) setPageNumber(1); setPdfScale(1) }

  useEffect(() => {
    const handleSelection = () => {
      setTimeout(() => {
        const selection = window.getSelection()
        const text = selection?.toString().trim()
        if (text && text.length > 3 && !text.includes('Ask AI')) {
          setSelectedText(text)
          setShowAskButton(true)
          if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
          hideTimeoutRef.current = setTimeout(() => setShowAskButton(false), 6000)
        }
      }, 10)
    }
    document.addEventListener('mouseup', handleSelection)
    return () => document.removeEventListener('mouseup', handleSelection)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable
      if (isInputFocused) return
      
      if (e.key === 'ArrowLeft') setPageNumber(p => Math.max(1, p - 1))
      else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setPageNumber(p => Math.min(numPages || 1, p + 1)) }
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [numPages, onClose])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleGetGist = async (lang = 'en') => {
    if (!selectedText) return
    setShowAskButton(false)
    setPanelOpen(true)
    setIsLoading(true)
    setMessages([])
    setInitialGist(null)
    setChatContext(selectedText)
    setActiveLang(lang)
    const gist = await getGistFromAI(selectedText, lang)
    setInitialGist(gist)
    setIsLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleComprehendPage = async (lang = 'en') => {
    setPanelOpen(true)
    setIsLoading(true)
    setIsSummarizing(true)
    setMessages([])
    setInitialGist(null)
    setSummaryLang(lang)
    setActiveLang(lang)
    
    const textLayer = document.querySelector('.react-pdf__Page__textContent')
    const textContent = textLayer?.textContent || ''
    
    if (textContent.trim().length < 10) {
      setInitialGist('Could not extract text from this page. Try selecting specific text instead.')
      setIsLoading(false)
      setIsSummarizing(false)
      return
    }
    
    setChatContext(textContent)
    setSelectedText(textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''))
    const gist = await getPageSummaryFromAI(textContent, lang)
    setInitialGist(gist)
    setIsLoading(false)
    setIsSummarizing(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    const userMsg = { role: 'user', content: inputValue }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)
    const langNames = { en: 'English', hi: 'Hindi', bn: 'Bengali' }
    const langInstruction = activeLang !== 'en' ? ` IMPORTANT: Respond only in ${langNames[activeLang]}. All your answers must be in ${langNames[activeLang]} language.` : ''
    const response = await chatWithAILang([{ role: 'system', content: `You are a helpful reading companion. Original passage: "${chatContext}". Answer based on this context.${langInstruction}` }, ...newMessages], activeLang)
    setMessages([...newMessages, response])
    setIsLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }

  const toggleBookmark = () => {
    const newBookmarks = bookmarks.includes(pageNumber) ? bookmarks.filter(b => b !== pageNumber) : [...bookmarks, pageNumber].sort((a, b) => a - b)
    setBookmarks(newBookmarks)
    onUpdateBook(bookId, { bookmarks: newBookmarks })
  }

  if (!book) return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Book not found</p>
        <button onClick={onClose} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium">Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col">
      <header className="flex-shrink-0 bg-white border-b border-gray-200/60 z-20">
        <div className="h-14 px-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <span className="w-5 h-5"><Icons.ChevronLeft /></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <span className="w-4 h-4 text-white"><Icons.Book /></span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{book.name.replace('.pdf', '')}</h2>
                <p className="text-xs text-gray-500">Page {pageNumber} of {numPages || '...'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <span className="w-4 h-4"><Icons.ChevronLeft /></span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100">
              <span className="text-sm font-semibold text-gray-900">{pageNumber}</span>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-gray-500">{numPages || '-'}</span>
            </div>
            <button onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} disabled={pageNumber >= (numPages || 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <span className="w-4 h-4"><Icons.ChevronRight /></span>
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick={toggleBookmark} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${bookmarks.includes(pageNumber) ? 'text-amber-500 bg-amber-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <span className="w-4 h-4"><Icons.Bookmark /></span>
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.25))} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-xs font-medium transition-colors">A−</button>
            <button onClick={() => setPdfScale(s => Math.min(3, s + 0.25))} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-xs font-medium transition-colors">A+</button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <div className="relative group">
              <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${panelOpen && isSummarizing ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <span className="w-4 h-4"><Icons.Sparkle /></span>
              </button>
              <div className="absolute top-full right-0 mt-2 py-2 bg-white rounded-xl shadow-xl border border-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]">
                <p className="px-3 py-1 text-xs text-gray-500 font-medium">Summarize Page</p>
                <button onClick={() => handleComprehendPage('en')} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">A</span>
                  <span>English</span>
                </button>
                <button onClick={() => handleComprehendPage('hi')} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">हि</span>
                  <span>Hindi</span>
                </button>
                <button onClick={() => handleComprehendPage('bn')} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">বা</span>
                  <span>Bengali</span>
                </button>
              </div>
            </div>
            <button onClick={() => { setPanelOpen(!panelOpen); setIsSummarizing(false); }} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${panelOpen && !isSummarizing ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <span className="w-4 h-4"><Icons.MessageSquare /></span>
            </button>
          </div>
        </div>
        
        <div className="h-0.5 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main ref={containerRef} className="flex-1 overflow-auto">
          <div className="min-h-full flex items-start justify-center py-10 px-6">
            {!pdfData ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading PDF...</p>
              </div>
            ) : (
              <div ref={viewerRef} className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} loading={
                  <div className="flex items-center justify-center h-96">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
                  </div>
                }>
                  <Page pageNumber={pageNumber} scale={pdfScale} renderTextLayer={true} renderAnnotationLayer={false} />
                </Document>
              </div>
            )}
          </div>
        </main>

        <aside className={`flex-shrink-0 bg-white border-l border-gray-200/60 flex flex-col transition-all duration-300 ease-out ${panelOpen ? 'w-80' : 'w-0'}`}>
          {panelOpen && (
            <>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25">
                      <span className="w-5 h-5 text-white"><Icons.Sparkle /></span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
                      <p className="text-xs text-gray-500">Your reading companion</p>
                    </div>
                  </div>
                  {activeLang !== 'en' && (
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      activeLang === 'hi' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {LANGUAGES[activeLang]?.name || 'English'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
                    <p className="text-sm text-gray-500">{isSummarizing ? 'Summarizing page...' : 'Getting explanation...'}</p>
                    <p className="text-xs text-gray-400">{LANGUAGES[summaryLang]?.name || 'English'}</p>
                  </div>
                ) : !initialGist && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-5 shadow-inner">
                      <span className="w-8 h-8 text-blue-600"><Icons.Sparkle /></span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Ready to Help</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Select text in the PDF and click "Ask AI" for instant explanations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {initialGist && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100/60">
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Selected</p>
                          <p className="text-sm text-gray-700 leading-relaxed">"{chatContext.length > 120 ? chatContext.substring(0, 120) + '...' : chatContext}"</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <span className="w-4 h-4 text-white"><Icons.Sparkle /></span>
                          </div>
                          <div className="flex-1">
                            <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {initialGist}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                          {activeLang === 'hi' ? 'नीचे अनुवर्ती प्रश्न पूछें' : activeLang === 'bn' ? 'নিচে ফॉলो-আপ প্রশ্ন জিজ্ঞাসা করুন' : 'Ask follow-up questions below'}
                        </p>
                      </div>
                    )}
                    {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyPress} 
                    placeholder={activeLang === 'hi' ? 'अनुवर्ती प्रश्न पूछें...' : activeLang === 'bn' ? 'ফॉলো-আপ প্রশ্ন জিজ্ঞাসা করুন...' : 'Ask a follow-up...'} disabled={!initialGist && messages.length === 0}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 transition-all" />
                  <button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center text-white transition-colors shadow-lg">
                    <span className="w-5 h-5"><Icons.Send /></span>
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {showAskButton && selectedText && (
        <div className="ask-ai-btn fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer animate-fade-in-up"
          style={{ bottom: '32px', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <span className="text-xs text-gray-500 font-medium px-2">Ask in:</span>
          <button onClick={() => { if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current); handleGetGist('en'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-105 active:scale-95">
            <span className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-xs font-bold">A</span>
            <span className="text-sm font-medium">English</span>
          </button>
          <button onClick={() => { if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current); handleGetGist('hi'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all hover:scale-105 active:scale-95">
            <span className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-xs font-bold">हि</span>
            <span className="text-sm font-medium">Hindi</span>
          </button>
          <button onClick={() => { if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current); handleGetGist('bn'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-105 active:scale-95">
            <span className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-xs font-bold">বা</span>
            <span className="text-sm font-medium">Bengali</span>
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <span className="text-gray-500 text-xs max-w-[120px] truncate px-2">"{selectedText.length > 25 ? selectedText.substring(0, 25) + '...' : selectedText}"</span>
        </div>
      )}
    </div>
  )
}

function App() {
  const [libraryMeta, setLibraryMeta] = useState(() => loadLibraryMeta())
  const [pdfStore, setPdfStore] = useState({})
  const [currentBookId, setCurrentBookId] = useState(null)

  const handleAddBook = useCallback((e) => {
    const file = e.target.files[0]
    if (!file || file.type !== 'application/pdf') return
    const reader = new FileReader()
    reader.onload = (event) => {
      const newBook = { id: Date.now().toString(), name: file.name, addedAt: new Date().toISOString(), lastRead: new Date().toISOString(), lastPage: null, totalPages: null, bookmarks: [] }
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
    setPdfStore(prev => { const n = {...prev}; delete n[bookId]; return n })
    if (currentBookId === bookId) setCurrentBookId(null)
  }, [libraryMeta, currentBookId])
  const handleUpdateBook = useCallback((bookId, updates) => {
    const newLibrary = libraryMeta.map(b => b.id === bookId ? {...b, ...updates} : b)
    setLibraryMeta(newLibrary)
    saveLibraryMeta(newLibrary)
  }, [libraryMeta])
  const handleCloseReader = useCallback(() => setCurrentBookId(null), [])

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans antialiased">
      <Library library={libraryMeta} onSelectBook={handleSelectBook} onDeleteBook={handleDeleteBook} onAddBook={handleAddBook} />
      {currentBookId && <PDFReader bookId={currentBookId} library={{ ...libraryMeta, [currentBookId]: { ...libraryMeta.find(b => b.id === currentBookId), data: pdfStore[currentBookId] } }} onUpdateBook={handleUpdateBook} onClose={handleCloseReader} />}
    </div>
  )
}

export default App
