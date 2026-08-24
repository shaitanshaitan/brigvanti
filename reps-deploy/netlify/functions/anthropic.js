// Serverless proxy for the Claude API.
// The client posts { max_tokens, messages }. This function adds the secret
// key and the model, so the key never reaches the browser.

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY" }) };
  }

  const model = process.env.CLAUDE_MODEL || "claude-sonnet-5";

  try {
    const body = JSON.parse(event.body || "{}");
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: body.max_tokens || 1000,
        messages: body.messages || [],
      }),
    });

    const data = await resp.json();
    return {
      statusCode: resp.status,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
