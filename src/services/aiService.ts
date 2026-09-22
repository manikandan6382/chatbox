/**
 * Google Gemini Live Streaming AI Service
 * Supports multimodal inputs (text + base64 images), full conversation context,
 * Server-Sent Events (SSE) streaming, AbortController cancellation, and auto-retry backoff.
 */

const MODEL_NAME = 'gemini-2.5-flash';

export interface ChatMessageContext {
  sender: 'user' | 'ai';
  text: string;
}

export function getGeminiApiKey(): string {
  return ((import.meta as any).env?.VITE_GEMINI_API_KEY || localStorage.getItem('maybank_gemini_api_key') || '').trim();
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem('maybank_gemini_api_key', key.trim());
}

export const MAYBANK_SYSTEM_PROMPT = `You are Maybank Singapore's Sovereign AI Financial Assistant operating on an interactive smart branch kiosk terminal in Singapore.
You assist retail and Premier Wealth clients with:
- Maybank Horizon Visa Signature (3.24 air miles per S$1 on dining/petrol, complimentary lounge access)
- High-yield savings, fixed deposits, and SRS investment portfolios
- MAS TRM (Monetary Authority of Singapore) regulatory compliance, Singpass MyInfo verification
- Wealth management, business banking, and personal financial queries

Guidelines:
- Maintain a warm, highly professional, elite banking tone (Maybank's motto: "Humanising Financial Services").
- Keep answers crisp, structured, and easy to read on a physical touchscreen kiosk (use markdown bold highlights, bullet points, short paragraphs).
- If an image/document is uploaded, inspect and analyze the document details accurately.`;

/**
 * Streams real-time tokens from Google Gemini API with AbortSignal and auto-retry backoff
 */
export async function* streamGeminiResponse(
  prompt: string,
  image?: string,
  history: ChatMessageContext[] = [],
  signal?: AbortSignal,
  customApiKey?: string
): AsyncGenerator<string, void, unknown> {
  const apiKey = (customApiKey || getGeminiApiKey()).trim();
  if (!apiKey) {
    throw new Error('Google Gemini API key is missing.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:streamGenerateContent?alt=sse&key=${apiKey}`;

  // Build conversation contents
  const contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
  }> = [];

  // Add recent context (last 6 messages)
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    if (msg.text && msg.text.trim()) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text.trim() }]
      });
    }
  }

  // Current user query parts
  const currentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
  
  if (prompt.trim()) {
    currentParts.push({ text: prompt.trim() });
  }

  // Handle uploaded base64 image if present
  if (image) {
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      currentParts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  if (currentParts.length === 0) {
    currentParts.push({ text: 'Hello' });
  }

  contents.push({
    role: 'user',
    parts: currentParts
  });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: MAYBANK_SYSTEM_PROMPT }]
    },
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1024
    }
  };

  // Safe fetch with 1-attempt exponential backoff on 429/503
  const executeFetch = async (retryCount = 0): Promise<Response> => {
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal
      });

      if ((resp.status === 429 || resp.status === 503) && retryCount < 1 && !signal?.aborted) {
        await new Promise(r => setTimeout(r, 1200));
        return executeFetch(retryCount + 1);
      }
      return resp;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      if (retryCount < 1 && !signal?.aborted) {
        await new Promise(r => setTimeout(r, 1200));
        return executeFetch(retryCount + 1);
      }
      throw err;
    }
  };

  const response = await executeFetch();

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by browser environment.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        return;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (signal?.aborted) return;
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (jsonStr) {
            try {
              const parsed = JSON.parse(jsonStr);
              const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textChunk) {
                yield textChunk;
              }
            } catch {
              // Partial JSON chunk, skip and continue
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
