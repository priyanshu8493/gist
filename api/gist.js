const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const readPayload = async (request) => {
  // Web Request (used by Vercel Edge/local dev middleware)
  if (typeof request.json === 'function') {
    return request.json().catch(() => null)
  }
  // Node IncomingMessage (used by some Vercel Node runtimes)
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    return null
  }
}

const createResult = async (request) => {
  if (String(request.method || '').toUpperCase() !== 'POST') {
    return { status: 405, body: { error: 'Method not allowed' } }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { status: 500, body: { error: 'GROQ_API_KEY is not configured' } }
  }

  const payload = await readPayload(request)
  const messages = payload?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, body: { error: 'Messages are required' } }
  }

  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: payload.max_tokens || 800,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error('Groq API error:', response.status, JSON.stringify(data))
      return {
        status: response.status,
        body: { error: data?.error?.message || `Groq request failed (${response.status})` },
      }
    }
    return { status: 200, body: data }
  } catch (error) {
    console.error('Groq request failed:', error)
    return { status: 502, body: { error: 'Could not reach the Groq API' } }
  }
}

export default async function handler(request, response) {
  const result = await createResult(request)

  // Legacy Node serverless signature: write to res, otherwise the request hangs.
  if (response && typeof response.status === 'function') {
    response.status(result.status)
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify(result.body))
    return
  }

  return Response.json(result.body, { status: result.status })
}
