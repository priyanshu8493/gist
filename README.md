# Gist — Your AI Reading Companion

> **Read smarter. Understand deeper. Learn faster.**

Gist is an AI-powered PDF reader that transforms how you interact with documents. Upload any PDF, select any passage, and get instant, intelligent explanations — powered by state-of-the-art language models.

## The Problem

Professionals, students, and researchers spend **hours** struggling through dense PDFs — papers, reports, textbooks, legal docs. Traditional PDF readers are passive viewers. They don't help you *understand*.

## The Solution

Gist turns passive reading into active learning:

- **Select → Gist** — Highlight any text and get an instant, clear explanation
- **Page Summary** — Comprehend entire pages with one click
- **Ask Anything** — Chat with an AI that understands your document's context
- **Multi-Language** — Get explanations in English, Hindi, or Bengali
- **Smart Library** — Track reading progress, bookmark key pages, search your collection

## Key Features

| Feature | Description |
|---------|-------------|
| AI Explanations | Select text → get instant, concise explanations |
| Full Page Analysis | One-click page summarization |
| Interactive Chat | Ask follow-up questions about any passage |
| Multi-Language | English, Hindi, Bengali support |
| Reading Progress | Auto-tracks where you left off |
| Bookmarks | Save and organize important pages |
| Searchable Library | Find any document instantly |

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4
- **PDF Engine:** react-pdf (PDF.js)
- **AI Backend:** Groq API (Llama 3.3 70B)
- **Storage:** Local-first (localStorage + Data URLs)

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd gist

# Install dependencies
npm install

# Add your Groq API key (free at console.groq.com)
cp .env.example .env
# Edit .env and add your key

# Start the dev server
npm run dev
```

## Why This Matters

The global e-learning market is projected to reach **$400B+ by 2026**. Knowledge workers deal with **hundreds of pages** of documents weekly. Gist sits at the intersection of AI and productivity — turning any PDF into an interactive learning experience.

## License

Private — All rights reserved.
