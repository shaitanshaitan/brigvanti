// netlify/functions/anthropic.js
// Serverless proxy for the Claude API used by the Brigvanti coach.
//
// The browser posts { max_tokens, messages }. This function attaches the
// secret key and the model server-side, checks a pilot key and origin,
// bounds cost per call, and is rate limited per visitor (see config below).
//
// Written in the modern Netlify function format so the rateLimit binds to
// the function and cannot be bypassed by calling the raw function URL.

const MAX_INPUT_CHARS = 8000;   // total chars across all message contents
const MAX_MESSAGES = 50;        // stop absurd message counts
const MAX_OUTPUT_TOKENS = 1200; // hard ceiling on generated tokens

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // 1) Soft origin check. Blocks calls made from other websites in a browser.
  //    Set BRIGVANTI_SITE_ORIGIN in Netlify env, e.g. https://brigvanti.netlify.app
  //    Leave it unset to skip this check while you configure things.
  const allowedOrigin = process.env.BRIGVANTI_SITE_ORIGIN;
  const origin = request.headers.get("origin");
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return json({ error: "Forbidden" }, 403);
  }

  // 2) Pilot key gate. Add BRIGVANTI_PILOT_KEY in Netlify env, send it from
  //    the app as the header x-brigvanti-key. Skipped if the env var is unset.
  const expectedKey = process.env.BRIGVANTI_PILOT_KEY;
  if (expectedKey) {
    if (request.headers.get("x-brigvanti-key") !== expectedKey) {
      return json({ error: "Unauthorized" }, 401);
    }
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error("Missing ANTHROPIC_API_KEY");
    return json({ error: "Server not configured" }, 500);
  }

  const model = process.env.CLAUDE_MODEL || "claude-sonnet-5";

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    return json({ error: "Bad request" }, 400);
  }

  // Validate each message and cap total input size.
  let totalChars = 0;
  for (const m of messages) {
    const role = m?.role;
    const content = m?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return json({ error: "Bad request" }, 400);
    }
    totalChars += content.length;
  }
  if (totalChars > MAX_INPUT_CHARS) {
    return json({ error: "Input too long" }, 413);
  }

  const maxTokens = Math.min(Number(body?.max_tokens) || 1000, MAX_OUTPUT_TOKENS);

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      // Log the detail server-side, return a generic error to the caller.
      console.error("Anthropic error", resp.status, data);
      return json({ error: "Upstream error" }, 502);
    }

    // Same response shape as before: the raw Anthropic message object.
    return json(data, 200);
  } catch (err) {
    console.error("Proxy error", err);
    return json({ error: "Request failed" }, 500);
  }
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

// Rate limit: 15 requests per 60 seconds per visitor (IP + domain).
// Plenty for a real learner working through reps, hostile to a loop.
export const config = {
  path: "/api/coach",
  rateLimit: {
    windowLimit: 15,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
