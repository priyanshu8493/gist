const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const messages = payload?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Messages are required' }, { status: 400 })
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
      return Response.json(
        { error: data?.error?.message || `Groq request failed (${response.status})` },
        { status: response.status },
      )
    }
    return Response.json(data)
  } catch (error) {
    console.error('Groq request failed:', error)
    return Response.json({ error: 'Could not reach the Groq API' }, { status: 502 })
  }
}
