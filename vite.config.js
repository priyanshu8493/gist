import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import groqHandler from './api/gist.js'

// Mirrors the Vercel serverless function so `npm run dev` works locally.
const localGistApi = {
  name: 'local-gist-api',
  configResolved(config) {
    const env = loadEnv(config.mode, process.cwd(), '')
    if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY
    if (env.GROQ_MODEL) process.env.GROQ_MODEL = env.GROQ_MODEL
  },
  configureServer(server) {
    server.middlewares.use('/api/gist', async (req, res) => {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)

      const request = new Request('http://localhost/api/gist', {
        method: req.method,
        headers: { 'content-type': req.headers['content-type'] || 'application/json' },
        body: chunks.length ? Buffer.concat(chunks) : undefined,
      })

      let response
      try {
        response = await groqHandler(request)
      } catch (error) {
        console.error('Local API handler failed:', error)
        response = Response.json({ error: 'API handler failed' }, { status: 500 })
      }

      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(await response.text())
    })
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localGistApi],
})
