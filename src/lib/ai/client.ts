/**
 * Unified AI Generation Client (Server-side only)
 * Primary: Google Gemini Flash
 * Fallback: Groq (openai/gpt-oss-120b / qwen/qwen3.8-27b)
 *
 * Rules:
 * - Server-side only: NEVER expose API keys to client components.
 * - Automatic failover with exponential backoff on 429 / 5xx / timeout.
 * - Per-run safety cap to prevent quota exhaustion.
 */

import 'server-only';

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  forceEngine?: 'gemini' | 'groq';
}

export interface GenerateTextResult {
  text: string;
  engine: 'gemini' | 'groq';
  model: string;
  fallbackOccurred: boolean;
  fallbackReason?: string;
}

const MAX_CALLS_PER_RUN = 25;
let callCount = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Gemini Flash REST API
 */
async function callGemini(
  prompt: string,
  systemInstruction?: string,
  temperature = 0.7,
  maxTokens = 2048,
  overrideModel?: string
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const model = overrideModel || 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned an empty candidate or no text');
    }

    return { text, model };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call Groq chat completions API
 */
async function callGroq(
  prompt: string,
  systemInstruction?: string,
  temperature = 0.7,
  maxTokens = 2048,
  preferredModel?: string
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const candidateModels = preferredModel
    ? [preferredModel]
    : ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b'];

  const messages: Array<{ role: string; content: string }> = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'wefik-world-agent/1.0',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Groq HTTP ${res.status} on model ${model}: ${errText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`Groq returned empty content on model ${model}`);
      }

      return { text: content, model };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Try next candidate model if available
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error('All Groq candidate models failed');
}

/**
 * Main generateText function:
 * Executes Gemini first, on 429 / 5xx / timeout fails over to Groq with backoff.
 */
export async function generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
  if (callCount >= MAX_CALLS_PER_RUN) {
    throw new Error(`Per-run safety cap reached (${MAX_CALLS_PER_RUN} AI calls). Aborting to prevent quota burns.`);
  }
  callCount++;

  const {
    prompt,
    systemInstruction,
    temperature = 0.7,
    maxTokens = 2048,
    forceEngine,
  } = options;

  // If forced to Groq
  if (forceEngine === 'groq') {
    const res = await callGroq(prompt, systemInstruction, temperature, maxTokens);
    return {
      text: res.text,
      engine: 'groq',
      model: res.model,
      fallbackOccurred: false,
    };
  }

  // If forced to Gemini
  if (forceEngine === 'gemini') {
    const res = await callGemini(prompt, systemInstruction, temperature, maxTokens);
    return {
      text: res.text,
      engine: 'gemini',
      model: res.model,
      fallbackOccurred: false,
    };
  }

  // Normal flow: Try Gemini primary
  let geminiError: Error | null = null;
  try {
    const res = await callGemini(prompt, systemInstruction, temperature, maxTokens);
    return {
      text: res.text,
      engine: 'gemini',
      model: res.model,
      fallbackOccurred: false,
    };
  } catch (err: unknown) {
    geminiError = err instanceof Error ? err : new Error(String(err));
  }

  // Gemini failed -> Log reason and trigger exponential backoff before Groq
  const reason = geminiError ? geminiError.message : 'Unknown Gemini error';
  console.warn(`[AI Client] Gemini Primary failed: ${reason}. Failing over to Groq...`);

  const backoffDelays = [1000, 2000, 4000];
  let groqError: Error | null = null;

  for (let attempt = 0; attempt < backoffDelays.length; attempt++) {
    const delay = backoffDelays[attempt];
    await sleep(delay);

    try {
      const res = await callGroq(prompt, systemInstruction, temperature, maxTokens);
      return {
        text: res.text,
        engine: 'groq',
        model: res.model,
        fallbackOccurred: true,
        fallbackReason: reason,
      };
    } catch (err: unknown) {
      groqError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI Client] Groq attempt ${attempt + 1} failed: ${groqError.message}`);
    }
  }

  throw new Error(`All AI engines failed. Primary Gemini error: ${reason}. Groq error: ${groqError?.message}`);
}

/**
 * Diagnostic key presence assertion (blind verification, never returns or logs actual key strings).
 */
export function checkAiKeyPresence(): {
  gemini: { configured: boolean; length: number };
  groq: { configured: boolean; length: number };
} {
  const gemini = process.env.GEMINI_API_KEY || '';
  const groq = process.env.GROQ_API_KEY || '';

  return {
    gemini: {
      configured: Boolean(gemini),
      length: gemini.length,
    },
    groq: {
      configured: Boolean(groq),
      length: groq.length,
    },
  };
}
